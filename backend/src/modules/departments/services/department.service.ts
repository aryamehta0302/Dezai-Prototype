import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createDepartment(institutionId: string, dto: CreateDepartmentDto, adminUserId: string) {
    const existing = await this.prisma.institutionDepartment.findUnique({
      where: {
        institutionId_name: {
          institutionId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Department with name "${dto.name}" already exists in this institution`);
    }

    if (dto.headFacultyId) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { id: dto.headFacultyId },
      });
      if (!faculty || faculty.institutionId !== institutionId) {
        throw new BadRequestException('Assigned head faculty does not belong to this institution');
      }
    }

    const dept = await this.prisma.institutionDepartment.create({
      data: {
        institutionId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        headFacultyId: dto.headFacultyId,
      },
      include: {
        headFaculty: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.DEPARTMENT_CREATED,
      `Department "${dept.name}" created for institution ${institutionId}`,
    );

    return dept;
  }

  async getDepartments(institutionId: string) {
    return this.prisma.institutionDepartment.findMany({
      where: { institutionId },
      include: {
        headFaculty: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: {
          select: {
            facultyMembers: true,
            programs: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getDepartmentById(departmentId: string, institutionId?: string) {
    const dept = await this.prisma.institutionDepartment.findUnique({
      where: { id: departmentId },
      include: {
        headFaculty: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        facultyMembers: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        programs: {
          select: { id: true, title: true, description: true },
        },
        _count: {
          select: {
            facultyMembers: true,
            programs: true,
          },
        },
      },
    });

    if (!dept) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    if (institutionId && dept.institutionId !== institutionId) {
      throw new NotFoundException(`Department not found in this institution`);
    }

    return dept;
  }

  async updateDepartment(
    departmentId: string,
    institutionId: string,
    dto: UpdateDepartmentDto,
    adminUserId: string,
  ) {
    await this.getDepartmentById(departmentId, institutionId);

    if (dto.name) {
      const existing = await this.prisma.institutionDepartment.findUnique({
        where: {
          institutionId_name: {
            institutionId,
            name: dto.name,
          },
        },
      });
      if (existing && existing.id !== departmentId) {
        throw new ConflictException(`Department with name "${dto.name}" already exists in this institution`);
      }
    }

    if (dto.headFacultyId) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { id: dto.headFacultyId },
      });
      if (!faculty || faculty.institutionId !== institutionId) {
        throw new BadRequestException('Assigned head faculty does not belong to this institution');
      }
    }

    const updated = await this.prisma.institutionDepartment.update({
      where: { id: departmentId },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        headFacultyId: dto.headFacultyId,
      },
      include: {
        headFaculty: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.DEPARTMENT_UPDATED,
      `Department "${updated.name}" (ID: ${departmentId}) updated`,
    );

    return updated;
  }

  async deleteDepartment(departmentId: string, institutionId: string, adminUserId: string) {
    const dept = await this.getDepartmentById(departmentId, institutionId);

    const facultyCount = await this.prisma.facultyMember.count({
      where: { departmentId },
    });
    const programCount = await this.prisma.program.count({
      where: { departmentId },
    });

    if (facultyCount > 0 || programCount > 0) {
      throw new BadRequestException(
        `Cannot delete department "${dept.name}". It is referenced by ${facultyCount} faculty members and ${programCount} programs. Reassign them first.`,
      );
    }

    await this.prisma.institutionDepartment.delete({
      where: { id: departmentId },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.DEPARTMENT_DELETED,
      `Department "${dept.name}" (ID: ${departmentId}) deleted`,
    );

    return { success: true, message: `Department "${dept.name}" deleted successfully` };
  }

  async assignDepartmentHead(departmentId: string, facultyId: string, institutionId: string, adminUserId: string) {
    await this.getDepartmentById(departmentId, institutionId);

    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id: facultyId },
    });
    if (!faculty || faculty.institutionId !== institutionId) {
      throw new BadRequestException('Faculty member does not belong to this institution');
    }

    const updated = await this.prisma.institutionDepartment.update({
      where: { id: departmentId },
      data: { headFacultyId: facultyId },
      include: {
        headFaculty: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.DEPARTMENT_UPDATED,
      `Assigned head of department for "${updated.name}" to faculty ID ${facultyId}`,
    );

    return updated;
  }

  async getDepartmentStatistics(departmentId: string, institutionId: string) {
    const dept = await this.getDepartmentById(departmentId, institutionId);

    const facultyCount = await this.prisma.facultyMember.count({
      where: { departmentId },
    });

    const programs = await this.prisma.program.findMany({
      where: { departmentId },
      select: { id: true },
    });
    const programIds = programs.map((p) => p.id);

    const studentCount = await this.prisma.enrollment.count({
      where: { programId: { in: programIds }, status: 'ACTIVE' },
    });

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessment: {
          module: {
            track: {
              programId: { in: programIds },
            },
          },
        },
      },
      select: { passed: true },
    });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    return {
      departmentId: dept.id,
      name: dept.name,
      facultyCount,
      programCount: programs.length,
      activeStudentCount: studentCount,
      totalAssessmentAttempts: totalAttempts,
      passRatePercent: passRate,
    };
  }
}
