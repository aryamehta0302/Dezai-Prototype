import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnterpriseAdminService } from '../services/enterprise-admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
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

@Controller('enterprise-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DEZAI_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER)
export class EnterpriseAdminController {
  constructor(private readonly service: EnterpriseAdminService) {}

  // ─────────────────── ORG SETTINGS ───────────────────

  /**
   * GET /enterprise-admin/org
   * Retrieve the organization profile and settings.
   */
  @Get('org')
  async getOrg(@Req() req, @Query('organizationId') orgId?: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      orgId,
    );
    const org = await this.service.getOrganization(resolvedOrgId);
    return { success: true, organization: org };
  }

  /**
   * PATCH /enterprise-admin/org/settings
   * Update org-level settings.
   */
  @Patch('org/settings')
  async updateOrgSettings(
    @Req() req,
    @Body() dto: UpdateOrgSettingsDto,
    @Query('organizationId') orgId?: string,
  ) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      orgId,
    );
    const org = await this.service.updateOrgSettings(
      resolvedOrgId,
      dto,
      req.user.id,
      req.user.role as UserRole,
    );
    return { success: true, organization: org };
  }

  // ─────────────────── DEPARTMENTS ───────────────────

  /**
   * GET /enterprise-admin/departments
   * List all departments with manager info and headcount.
   */
  @Get('departments')
  async getDepartments(@Req() req, @Query('organizationId') orgId?: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      orgId,
    );
    const departments = await this.service.getDepartments(resolvedOrgId);
    return { success: true, departments };
  }

  /**
   * GET /enterprise-admin/departments/:id
   * Get a single department by ID. (Ownership verified via IDOR checks)
   */
  @Get('departments/:id')
  async getDepartment(@Req() req, @Param('id') id: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    const department = await this.service.getDepartmentById(
      id,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, department };
  }

  /**
   * POST /enterprise-admin/departments
   * Create a new department.
   */
  @Post('departments')
  async createDepartment(@Req() req, @Body() dto: CreateDepartmentDto) {
    // Inject the resolved organizationId into the DTO
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      dto.organizationId || undefined,
    );
    dto.organizationId = resolvedOrgId;
    const department = await this.service.createDepartment(dto, req.user.id, req.user.role as UserRole);
    return { success: true, department };
  }

  /**
   * PATCH /enterprise-admin/departments/:id
   * Update a department's name or description. (Ownership verified via IDOR checks)
   */
  @Patch('departments/:id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req,
  ) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    const department = await this.service.updateDepartment(
      id,
      dto,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, department };
  }

  /**
   * DELETE /enterprise-admin/departments/:id
   * Delete a department. Employees become department-less (SetNull). (Ownership verified)
   */
  @Delete('departments/:id')
  @HttpCode(HttpStatus.OK)
  async deleteDepartment(@Param('id') id: string, @Req() req) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    await this.service.deleteDepartment(
      id,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, message: 'Department deleted' };
  }

  /**
   * GET /enterprise-admin/departments-stats
   * Aggregate stats: headcount per dept, managers assigned/unassigned.
   */
  @Get('departments-stats')
  async getDepartmentStats(@Req() req, @Query('organizationId') orgId?: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      orgId,
    );
    const stats = await this.service.getDepartmentStats(resolvedOrgId);
    return { success: true, ...stats };
  }

  // ─────────────────── EMPLOYEES ───────────────────

  /**
   * GET /enterprise-admin/employees/search
   * Paginated search with name/email, dept, manager, status filters.
   */
  @Get('employees/search')
  async searchEmployees(
    @Req() req,
    @Query() query: EmployeeSearchDto,
    @Query('organizationId') orgId?: string,
  ) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      orgId || query.organizationId,
    );
    const result = await this.service.searchEmployees(resolvedOrgId, query);
    return { success: true, ...result };
  }

  /**
   * GET /enterprise-admin/employees
   * List all employees in an organization.
   */
  @Get('employees')
  async getEmployees(@Req() req, @Query('organizationId') orgId?: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      orgId,
    );
    const employees = await this.service.getAllEmployees(resolvedOrgId);
    return { success: true, employees };
  }

  /**
   * GET /enterprise-admin/employees/:id
   * Get a single employee by their employee record ID. (Ownership verified)
   */
  @Get('employees/:id')
  async getEmployee(@Req() req, @Param('id') id: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    const employee = await this.service.getEmployeeById(
      id,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, employee };
  }

  /**
   * GET /enterprise-admin/employees/:id/profile
   * Full employee profile: personal info, dept, manager, direct reports. (Ownership verified)
   */
  @Get('employees/:id/profile')
  async getEmployeeProfile(@Req() req, @Param('id') id: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    const employee = await this.service.getEmployeeProfile(
      id,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, employee };
  }

  /**
   * POST /enterprise-admin/employees
   * Create a new employee record linked to an existing user.
   */
  @Post('employees')
  async createEmployee(@Req() req, @Body() dto: CreateEmployeeDto) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      dto.organizationId || undefined,
    );
    dto.organizationId = resolvedOrgId;
    const employee = await this.service.createEmployee(dto, req.user.id, req.user.role as UserRole);
    return { success: true, employee };
  }

  /**
   * PATCH /enterprise-admin/employees/:id
   * Update an employee's title or employment status. (Ownership verified)
   */
  @Patch('employees/:id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req,
  ) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    const employee = await this.service.updateEmployee(
      id,
      dto,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, employee };
  }

  /**
   * DELETE /enterprise-admin/employees/:id
   * Remove an employee record from the organization. (Ownership verified)
   */
  @Delete('employees/:id')
  @HttpCode(HttpStatus.OK)
  async deleteEmployee(@Param('id') id: string, @Req() req) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    await this.service.deleteEmployee(
      id,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, message: 'Employee removed' };
  }

  // ─────────────────── ASSIGNMENT ───────────────────

  /**
   * PATCH /enterprise-admin/employees/:id/department
   * Assign or reassign an employee to a department. Send null to orphan. (Ownership verified)
   */
  @Patch('employees/:id/department')
  async assignDepartment(
    @Param('id') employeeId: string,
    @Body() dto: AssignDepartmentDto,
    @Req() req,
  ) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    const employee = await this.service.assignDepartment(
      employeeId,
      dto,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, employee };
  }

  /**
   * PATCH /enterprise-admin/employees/:id/manager
   * Assign a manager. Guards: no self-assign, no circular chains. (Ownership verified)
   */
  @Patch('employees/:id/manager')
  async assignManager(
    @Param('id') employeeId: string,
    @Body() dto: AssignManagerDto,
    @Req() req,
  ) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
    );
    const employee = await this.service.assignManager(
      employeeId,
      dto,
      resolvedOrgId,
      req.user.role as UserRole,
      req.user.id,
    );
    return { success: true, employee };
  }

  // ─────────────────── ORG DIRECTORY ───────────────────

  /**
   * GET /enterprise-admin/directory
   * Browsable org directory: all employees with dept + manager inline.
   */
  @Get('directory')
  async getOrgDirectory(@Req() req, @Query('organizationId') orgId?: string) {
    const resolvedOrgId = await this.service.resolveOrganizationId(
      req.user.id,
      req.user.role as UserRole,
      orgId,
    );
    const directory = await this.service.getOrgDirectory(resolvedOrgId);
    return { success: true, directory };
  }
}
