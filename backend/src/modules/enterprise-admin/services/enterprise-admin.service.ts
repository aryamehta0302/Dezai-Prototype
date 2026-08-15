import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { EnterpriseAdminRepository } from '../repositories/enterprise-admin.repository';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  AssignDepartmentDto,
  AssignManagerDto,
  EmployeeSearchDto,
  UpdateOrgSettingsDto,
} from '../dto/enterprise-admin.dto';
import { AuditAction, UserRole } from '@prisma/client';

@Injectable()
export class EnterpriseAdminService {
  private readonly logger = new Logger(EnterpriseAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: EnterpriseAdminRepository,
    private readonly auditService: AuditService,
  ) {}

  // ─────────────────── ORG RESOLUTION ───────────────────

  async resolveOrganizationId(
    userId: string,
    role: UserRole,
    requestedOrganizationId?: string,
  ): Promise<string> {
    if (role === UserRole.DEZAI_ADMIN && requestedOrganizationId) {
      return requestedOrganizationId;
    }

    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    const orgAdmin = await this.prisma.organizationAdmin.findUnique({ where: { userId } });
    const organizationId = employee?.organizationId || orgAdmin?.organizationId;

    if (!organizationId) {
      this.logger.warn(`Security Warning: User ${userId} with role ${role} attempted to resolve organization ID but has no organization context.`);
      throw new BadRequestException('Organization context not found for user');
    }
    return organizationId;
  }

  // ─────────────────── SECURITY / OWNERSHIP VALIDATION ───────────────────

  /**
   * Asserts that the actor has permission to access/modify a resource by validating
   * that the resource's organizationId matches the actor's resolved organizationId.
   * DEZAI_ADMIN bypasses all ownership checks.
   */
  private validateResourceOwnership(
    resourceOrgId: string,
    resolvedOrgId: string,
    role: UserRole,
    resourceType: 'Department' | 'Employee',
    resourceId: string,
    actorId: string,
  ) {
    if (role === UserRole.DEZAI_ADMIN) return;
    if (resourceOrgId !== resolvedOrgId) {
      this.logger.warn(
        `Security Violation Logged: Actor ${actorId} (Org Context: ${resolvedOrgId}, Role: ${role}) ` +
        `attempted unauthorized access/mutation on ${resourceType} ID: ${resourceId} which belongs to Org: ${resourceOrgId}`
      );
      throw new ForbiddenException(`You do not have access to this ${resourceType.toLowerCase()}`);
    }
  }

  // ─────────────────── ORGANIZATION ───────────────────

  async getOrganization(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateOrgSettings(
    organizationId: string,
    dto: UpdateOrgSettingsDto,
    actorId: string,
    actorRole: UserRole,
  ) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: dto,
    });

    await this.auditService.logAction(
      actorId,
      AuditAction.ORGANIZATION_CREATED,
      `Org settings updated for ${organizationId}`,
      undefined,
      actorRole,
    );

    return updated;
  }

  // ─────────────────── DEPARTMENTS ───────────────────

  async getDepartments(organizationId: string) {
    return this.repo.findAllDepartments(organizationId);
  }

  async getDepartmentById(
    id: string,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const dept = await this.repo.findDepartmentById(id);
    if (!dept) throw new NotFoundException('Department not found');

    this.validateResourceOwnership(dept.organizationId, resolvedOrgId, actorRole, 'Department', id, actorId);
    return dept;
  }

  async createDepartment(
    dto: CreateDepartmentDto,
    actorId: string,
    actorRole: UserRole,
  ) {
    const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    if (dto.managerId) {
      // Validate that manager belongs to same org
      const manager = await this.repo.findEmployeeById(dto.managerId);
      if (!manager || manager.organizationId !== dto.organizationId) {
        this.logger.warn(`Validation Error: Actor ${actorId} tried to assign manager ${dto.managerId} to department but manager does not belong to Org ${dto.organizationId}`);
        throw new BadRequestException('Manager must belong to the same organization');
      }
    }

    const dept = await this.repo.createDepartment({
      name: dto.name,
      description: dto.description,
      organizationId: dto.organizationId,
      managerId: dto.managerId ?? null,
    });

    await this.auditService.logAction(
      actorId,
      AuditAction.ORGANIZATION_CREATED,
      `Department "${dept.name}" created in org ${dto.organizationId}`,
      undefined,
      actorRole,
    );

    this.logger.log(`Department created: ${dept.id} — "${dept.name}"`);
    return dept;
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const existing = await this.repo.findDepartmentById(id);
    if (!existing) throw new NotFoundException('Department not found');

    this.validateResourceOwnership(existing.organizationId, resolvedOrgId, actorRole, 'Department', id, actorId);

    const updated = await this.repo.updateDepartment(id, dto);

    await this.auditService.logAction(
      actorId,
      AuditAction.ORGANIZATION_CREATED,
      `Department "${id}" updated`,
      undefined,
      actorRole,
    );

    return updated;
  }

  async deleteDepartment(
    id: string,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const existing = await this.repo.findDepartmentById(id);
    if (!existing) throw new NotFoundException('Department not found');

    this.validateResourceOwnership(existing.organizationId, resolvedOrgId, actorRole, 'Department', id, actorId);

    // On delete, employees in this dept become orphaned (departmentId → SetNull in schema)
    await this.repo.deleteDepartment(id);

    await this.auditService.logAction(
      actorId,
      AuditAction.ORGANIZATION_CREATED,
      `Department "${id}" deleted. ${existing._count.employees} employees orphaned.`,
      undefined,
      actorRole,
    );

    this.logger.warn(
      `Department ${id} deleted — ${existing._count.employees} employees are now department-less`,
    );
  }

  // ─────────────────── EMPLOYEES ───────────────────

  async getAllEmployees(organizationId: string) {
    return this.repo.findAllEmployees(organizationId);
  }

  async getEmployeeById(
    id: string,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const emp = await this.repo.findEmployeeById(id);
    if (!emp) throw new NotFoundException('Employee not found');

    this.validateResourceOwnership(emp.organizationId, resolvedOrgId, actorRole, 'Employee', id, actorId);
    return emp;
  }

  async createEmployee(dto: CreateEmployeeDto, actorId: string, actorRole: UserRole) {
    const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    // Prevent duplicate employee records for the same user
    const existing = await this.prisma.employee.findUnique({ where: { userId: dto.userId } });
    if (existing) throw new ConflictException('User is already an employee in an organization');

    if (dto.departmentId) {
      const dept = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, organizationId: dto.organizationId },
      });
      if (!dept) throw new NotFoundException('Department not found in this organization');
    }

    const emp = await this.repo.createEmployee({
      userId: dto.userId,
      organizationId: dto.organizationId,
      departmentId: dto.departmentId ?? null,
      title: dto.title ?? null,
      employmentStatus: dto.employmentStatus ?? 'INVITED',
      invitedAt: new Date(),
    });

    await this.auditService.logAction(
      actorId,
      AuditAction.EMPLOYEE_INVITED,
      `Employee created for user ${dto.userId} in org ${dto.organizationId}`,
      undefined,
      actorRole,
    );

    this.logger.log(`Employee created: ${emp.id}`);
    return emp;
  }

  async updateEmployee(
    id: string,
    dto: UpdateEmployeeDto,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const existing = await this.repo.findEmployeeById(id);
    if (!existing) throw new NotFoundException('Employee not found');

    this.validateResourceOwnership(existing.organizationId, resolvedOrgId, actorRole, 'Employee', id, actorId);

    return this.repo.updateEmployee(id, dto);
  }

  async deleteEmployee(
    id: string,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const existing = await this.repo.findEmployeeById(id);
    if (!existing) throw new NotFoundException('Employee not found');

    this.validateResourceOwnership(existing.organizationId, resolvedOrgId, actorRole, 'Employee', id, actorId);

    await this.repo.deleteEmployee(id);

    await this.auditService.logAction(
      actorId,
      AuditAction.EMPLOYEE_JOINED,
      `Employee ${id} removed from org`,
      undefined,
      actorRole,
    );
  }

  // ─────────────────── EMPLOYEE ASSIGNMENT ───────────────────

  async assignDepartment(
    employeeId: string,
    dto: AssignDepartmentDto,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const emp = await this.repo.findEmployeeById(employeeId);
    if (!emp) throw new NotFoundException('Employee not found');

    this.validateResourceOwnership(emp.organizationId, resolvedOrgId, actorRole, 'Employee', employeeId, actorId);

    if (dto.departmentId) {
      const dept = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, organizationId: emp.organizationId },
      });
      if (!dept) throw new NotFoundException('Department not found in this organization');

      // Idempotent: already assigned — return without a write
      if (emp.departmentId === dto.departmentId) {
        return emp;
      }
    }

    const updated = await this.repo.updateEmployee(employeeId, {
      departmentId: dto.departmentId ?? null,
    });

    this.logger.log(
      `Employee ${employeeId} assigned to department ${dto.departmentId ?? 'null (orphaned)'}`,
    );

    return updated;
  }

  // ─────────────────── MANAGER ASSIGNMENT ───────────────────

  async assignManager(
    employeeId: string,
    dto: AssignManagerDto,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const emp = await this.repo.findEmployeeById(employeeId);
    if (!emp) throw new NotFoundException('Employee not found');

    this.validateResourceOwnership(emp.organizationId, resolvedOrgId, actorRole, 'Employee', employeeId, actorId);

    // Null managerId = remove manager
    if (!dto.managerId) {
      return this.repo.updateEmployee(employeeId, { managerId: null });
    }

    if (dto.managerId === employeeId) {
      this.logger.warn(`Validation Warning: Actor ${actorId} tried to assign employee ${employeeId} as their own manager.`);
      throw new BadRequestException('An employee cannot be their own manager');
    }

    const manager = await this.repo.findEmployeeById(dto.managerId);
    if (!manager) throw new NotFoundException('Manager employee not found');

    if (manager.organizationId !== emp.organizationId) {
      this.logger.warn(`Security Warning: Actor ${actorId} tried to assign manager ${dto.managerId} (Org ${manager.organizationId}) to employee ${employeeId} (Org ${emp.organizationId}) — Org Mismatch`);
      throw new BadRequestException('Manager must belong to the same organization');
    }

    // Walk the proposed manager's chain to detect cycles
    const chain = await this.repo.getManagerChain(dto.managerId);
    if (chain.includes(employeeId)) {
      this.logger.warn(`Validation Warning: Actor ${actorId} tried to assign manager ${dto.managerId} to employee ${employeeId} which creates a circular dependency chain.`);
      throw new BadRequestException('Circular manager chain detected: this assignment would create a cycle');
    }

    const updated = await this.repo.updateEmployee(employeeId, { managerId: dto.managerId });
    this.logger.log(`Employee ${employeeId} manager set to ${dto.managerId}`);
    return updated;
  }

  // ─────────────────── SEARCH ───────────────────

  async searchEmployees(organizationId: string, params: EmployeeSearchDto) {
    return this.repo.searchEmployees(organizationId, params);
  }

  // ─────────────────── ORG DIRECTORY ───────────────────

  async getOrgDirectory(organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');
    return this.repo.getOrgDirectory(organizationId);
  }

  // ─────────────────── EMPLOYEE PROFILE ───────────────────

  async getEmployeeProfile(
    employeeId: string,
    resolvedOrgId: string,
    actorRole: UserRole,
    actorId: string,
  ) {
    const emp = await this.repo.findEmployeeById(employeeId);
    if (!emp) throw new NotFoundException('Employee not found');

    this.validateResourceOwnership(emp.organizationId, resolvedOrgId, actorRole, 'Employee', employeeId, actorId);
    return emp;
  }

  // ─────────────────── DEPARTMENT STATS ───────────────────

  async getDepartmentStats(organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');
    return this.repo.getDepartmentStats(organizationId);
  }

  // ─────────────────── PRIVATE HELPERS ───────────────────

  private async validateEmployeeBelongsToOrg(employeeId: string, organizationId: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });
    if (!emp) {
      throw new BadRequestException('Employee does not belong to this organization');
    }
    return emp;
  }
}
