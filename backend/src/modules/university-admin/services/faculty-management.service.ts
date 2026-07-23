import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction, FacultyVerificationStatus, AccountStatus, UserRole } from '@prisma/client';
import {
  CreateFacultyRegistrationDto,
  UpdateFacultyProfileDto,
  RejectFacultyDto,
} from '../dto/faculty-management.dto';

@Injectable()
export class FacultyManagementService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getPendingFacultyRegistrations(institutionId: string) {
    return this.prisma.facultyMember.findMany({
      where: {
        institutionId,
        verificationStatus: FacultyVerificationStatus.PENDING,
      },
      include: {
        user: { select: { id: true, name: true, email: true, accountStatus: true, createdAt: true } },
        institutionDept: { select: { id: true, name: true, code: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async getAllFaculty(
    institutionId: string,
    filters?: { departmentId?: string; status?: FacultyVerificationStatus; search?: string },
  ) {
    const where: any = { institutionId };

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }
    if (filters?.status) {
      where.verificationStatus = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { designation: { contains: filters.search, mode: 'insensitive' } },
        { employeeId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.facultyMember.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, accountStatus: true, lastActiveAt: true } },
        institutionDept: { select: { id: true, name: true, code: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });
  }

  async getFacultyById(facultyId: string, institutionId: string) {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id: facultyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            accountStatus: true,
            createdAt: true,
            lastActiveAt: true,
          },
        },
        institutionDept: true,
        programs: { select: { id: true, title: true, description: true } },
        mentorFor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            program: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!faculty || faculty.institutionId !== institutionId) {
      throw new NotFoundException(`Faculty member with ID ${facultyId} not found in this institution`);
    }

    // Retrieve documents via Upload model polymorphic association
    const documents = await this.prisma.upload.findMany({
      where: {
        entityType: 'FacultyMember',
        entityId: facultyId,
      },
    });

    return {
      ...faculty,
      documents,
    };
  }

  async approveFaculty(facultyId: string, institutionId: string, adminUserId: string) {
    const faculty = await this.getFacultyById(facultyId, institutionId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: faculty.userId },
        data: { accountStatus: AccountStatus.ACTIVE },
      });

      return tx.facultyMember.update({
        where: { id: facultyId },
        data: { verificationStatus: FacultyVerificationStatus.APPROVED },
        include: {
          user: { select: { id: true, name: true, email: true, accountStatus: true } },
          institutionDept: true,
        },
      });
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.FACULTY_APPROVED,
      `Faculty member "${faculty.user.name}" (${facultyId}) approved`,
    );

    return updated;
  }

  async rejectFaculty(facultyId: string, institutionId: string, adminUserId: string, dto?: RejectFacultyDto) {
    const faculty = await this.getFacultyById(facultyId, institutionId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: faculty.userId },
        data: { accountStatus: AccountStatus.REJECTED },
      });

      return tx.facultyMember.update({
        where: { id: facultyId },
        data: { verificationStatus: FacultyVerificationStatus.REJECTED },
        include: {
          user: { select: { id: true, name: true, email: true, accountStatus: true } },
          institutionDept: true,
        },
      });
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.FACULTY_REJECTED,
      `Faculty member "${faculty.user.name}" (${facultyId}) rejected. Reason: ${dto?.reason || 'None provided'}`,
    );

    return updated;
  }

  async assignFacultyToUniversity(userId: string, institutionId: string, dto: CreateFacultyRegistrationDto, adminUserId: string) {
    const existingFaculty = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });
    if (existingFaculty) {
      throw new ConflictException('User is already registered as a faculty member');
    }

    const dept = await this.prisma.institutionDepartment.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept || dept.institutionId !== institutionId) {
      throw new BadRequestException('Department does not belong to this institution');
    }

    const faculty = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.FACULTY, accountStatus: AccountStatus.PENDING_VERIFICATION },
      });

      return tx.facultyMember.create({
        data: {
          userId,
          institutionId,
          departmentId: dto.departmentId,
          designation: dto.designation,
          employeeId: dto.employeeId,
          contactNumber: dto.contactNumber,
          verificationStatus: FacultyVerificationStatus.PENDING,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          institutionDept: true,
        },
      });
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.FACULTY_ASSIGNED,
      `Faculty member assigned to user ${userId} in department ${dept.name}`,
    );

    return faculty;
  }

  async suspendFaculty(facultyId: string, institutionId: string, adminUserId: string) {
    const faculty = await this.getFacultyById(facultyId, institutionId);

    await this.prisma.user.update({
      where: { id: faculty.userId },
      data: {
        accountStatus: AccountStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedById: adminUserId,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.FACULTY_SUSPENDED,
      `Faculty member "${faculty.user.name}" (${facultyId}) suspended`,
    );

    return { success: true, message: `Faculty member suspended successfully` };
  }

  async reactivateFaculty(facultyId: string, institutionId: string, adminUserId: string) {
    const faculty = await this.getFacultyById(facultyId, institutionId);

    await this.prisma.user.update({
      where: { id: faculty.userId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        suspendedAt: null,
        suspendedById: null,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.FACULTY_REACTIVATED,
      `Faculty member "${faculty.user.name}" (${facultyId}) reactivated`,
    );

    return { success: true, message: `Faculty member reactivated successfully` };
  }

  async removeFacultyFromUniversity(facultyId: string, institutionId: string, adminUserId: string) {
    const faculty = await this.getFacultyById(facultyId, institutionId);

    const programCount = await this.prisma.program.count({
      where: { facultyId },
    });
    if (programCount > 0) {
      throw new BadRequestException(
        `Cannot remove faculty member. They are assigned as lead for ${programCount} programs. Reassign programs first.`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.enrollment.updateMany({
        where: { mentorFacultyId: facultyId },
        data: { mentorFacultyId: null },
      }),
      this.prisma.facultyMember.delete({
        where: { id: facultyId },
      }),
    ]);

    await this.auditService.logAction(
      adminUserId,
      AuditAction.FACULTY_REMOVED,
      `Faculty member "${faculty.user.name}" (${facultyId}) removed from university`,
    );

    return { success: true, message: `Faculty member removed successfully` };
  }

  async updateFacultyProfile(facultyId: string, institutionId: string, dto: UpdateFacultyProfileDto, adminUserId: string) {
    const faculty = await this.getFacultyById(facultyId, institutionId);

    if (dto.departmentId) {
      const dept = await this.prisma.institutionDepartment.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept || dept.institutionId !== institutionId) {
        throw new BadRequestException('Department does not belong to this institution');
      }
    }

    if (dto.fullName) {
      await this.prisma.user.update({
        where: { id: faculty.userId },
        data: { name: dto.fullName },
      });
    }

    const updated = await this.prisma.facultyMember.update({
      where: { id: facultyId },
      data: {
        departmentId: dto.departmentId,
        designation: dto.designation,
        employeeId: dto.employeeId,
        contactNumber: dto.contactNumber,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        institutionDept: true,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.PROFILE_UPDATED,
      `Faculty profile updated for ID ${facultyId}`,
    );

    return updated;
  }
}
