import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';
import { UpdateUniversityProfileDto } from '../dto/university-settings.dto';

@Injectable()
export class UniversitySettingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getUniversityProfile(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        admins: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: {
          select: {
            faculty: true,
            programs: true,
            institutionDepartments: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${institutionId} not found`);
    }

    return institution;
  }

  async updateUniversityProfile(institutionId: string, dto: UpdateUniversityProfileDto, adminUserId: string) {
    await this.getUniversityProfile(institutionId);

    const updated = await this.prisma.institution.update({
      where: { id: institutionId },
      data: dto,
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.INSTITUTION_UPDATED,
      `Updated university profile for "${updated.name}"`,
    );

    return updated;
  }

  async getFacultyStatistics(institutionId: string) {
    const byStatus = await this.prisma.facultyMember.groupBy({
      by: ['verificationStatus'],
      where: { institutionId },
      _count: { _all: true },
    });

    const byDepartment = await this.prisma.facultyMember.groupBy({
      by: ['departmentId'],
      where: { institutionId },
      _count: { _all: true },
    });

    const departments = await this.prisma.institutionDepartment.findMany({
      where: { institutionId },
      select: { id: true, name: true },
    });
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    return {
      byVerificationStatus: byStatus.map((s) => ({
        status: s.verificationStatus,
        count: s._count._all,
      })),
      byDepartment: byDepartment.map((d) => ({
        departmentId: d.departmentId,
        departmentName: d.departmentId ? deptMap.get(d.departmentId) || 'Unassigned' : 'Unassigned',
        count: d._count._all,
      })),
    };
  }

  async getStudentStatistics(institutionId: string) {
    const programs = await this.prisma.program.findMany({
      where: { institutionId },
      select: { id: true, title: true },
    });
    const programIds = programs.map((p) => p.id);

    const byProgram = await this.prisma.enrollment.groupBy({
      by: ['programId'],
      where: { programId: { in: programIds } },
      _count: { _all: true },
    });

    const byStatus = await this.prisma.enrollment.groupBy({
      by: ['status'],
      where: { programId: { in: programIds } },
      _count: { _all: true },
    });

    const progMap = new Map(programs.map((p) => [p.id, p.title]));

    return {
      byProgram: byProgram.map((p) => ({
        programId: p.programId,
        programTitle: progMap.get(p.programId) || 'Unknown',
        count: p._count._all,
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
    };
  }

  async getActivePrograms(institutionId: string) {
    return this.prisma.program.findMany({
      where: { institutionId },
      include: {
        faculty: { include: { user: { select: { id: true, name: true } } } },
        institutionDept: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, tracks: true } },
      },
      orderBy: { title: 'asc' },
    });
  }

  async getAnalyticsDashboard(institutionId: string) {
    const [facultyStats, studentStats, programs] = await Promise.all([
      this.getFacultyStatistics(institutionId),
      this.getStudentStatistics(institutionId),
      this.getActivePrograms(institutionId),
    ]);

    return {
      facultyStats,
      studentStats,
      activeProgramsCount: programs.length,
      programsOverview: programs,
    };
  }
}
