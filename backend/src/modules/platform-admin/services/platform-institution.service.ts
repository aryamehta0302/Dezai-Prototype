import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction, InstitutionStatus } from '@prisma/client';
import { RejectInstitutionDto, SuspendInstitutionDto } from '../dto/platform-institution.dto';

@Injectable()
export class PlatformInstitutionService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllInstitutions(filters?: { status?: InstitutionStatus; search?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { country: { contains: filters.search, mode: 'insensitive' } },
        { state: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.institution.findMany({
      where,
      include: {
        _count: {
          select: {
            faculty: true,
            admins: true,
            programs: true,
            institutionDepartments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstitutionById(institutionId: string) {
    const inst = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        admins: { include: { user: { select: { id: true, name: true, email: true } } } },
        faculty: { include: { user: { select: { id: true, name: true, email: true } }, institutionDept: true } },
        institutionDepartments: true,
        programs: { select: { id: true, title: true, _count: { select: { enrollments: true } } } },
      },
    });

    if (!inst) {
      throw new NotFoundException(`Institution with ID ${institutionId} not found`);
    }

    return inst;
  }

  async approveInstitution(institutionId: string, adminUserId: string) {
    await this.getInstitutionById(institutionId);

    const updated = await this.prisma.institution.update({
      where: { id: institutionId },
      data: {
        status: InstitutionStatus.APPROVED,
        approvedAt: new Date(),
        approvedById: adminUserId,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.UNIVERSITY_APPROVED,
      `University "${updated.name}" (${institutionId}) approved`,
    );

    return updated;
  }

  async rejectInstitution(institutionId: string, adminUserId: string, dto?: RejectInstitutionDto) {
    await this.getInstitutionById(institutionId);

    const updated = await this.prisma.institution.update({
      where: { id: institutionId },
      data: {
        status: InstitutionStatus.REJECTED,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.UNIVERSITY_REJECTED,
      `University "${updated.name}" (${institutionId}) rejected. Reason: ${dto?.reason || 'None'}`,
    );

    return updated;
  }

  async suspendInstitution(institutionId: string, adminUserId: string, dto?: SuspendInstitutionDto) {
    const inst = await this.getInstitutionById(institutionId);

    const updated = await this.prisma.institution.update({
      where: { id: institutionId },
      data: {
        status: InstitutionStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedById: adminUserId,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.UNIVERSITY_SUSPENDED,
      `University "${inst.name}" (${institutionId}) suspended. No child records mutated. Reason: ${dto?.reason || 'None'}`,
    );

    return {
      success: true,
      message: `Institution "${inst.name}" suspended. All user access is blocked at guard level.`,
      institution: updated,
    };
  }

  async reactivateInstitution(institutionId: string, adminUserId: string) {
    const inst = await this.getInstitutionById(institutionId);

    const updated = await this.prisma.institution.update({
      where: { id: institutionId },
      data: {
        status: InstitutionStatus.APPROVED,
        suspendedAt: null,
        suspendedById: null,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.UNIVERSITY_REACTIVATED,
      `University "${inst.name}" (${institutionId}) reactivated. Access restored instantly.`,
    );

    return {
      success: true,
      message: `Institution "${inst.name}" reactivated successfully.`,
      institution: updated,
    };
  }
}
