import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';
import { AssignMentorDto, ChangeMentorDto } from '../dto/student-management.dto';

@Injectable()
export class StudentOversightService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllStudents(
    institutionId: string,
    filters?: { programId?: string; search?: string; status?: string },
  ) {
    const programs = await this.prisma.program.findMany({
      where: { institutionId },
      select: { id: true },
    });
    const programIds = programs.map((p) => p.id);

    const where: any = {
      programId: { in: programIds },
    };

    if (filters?.programId) {
      if (!programIds.includes(filters.programId)) {
        throw new BadRequestException('Program does not belong to this institution');
      }
      where.programId = filters.programId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.user = {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
            streakCount: true,
            accountStatus: true,
            lastActiveAt: true,
          },
        },
        program: { select: { id: true, title: true } },
        mentor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentDetail(studentUserId: string, institutionId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        streakCount: true,
        accountStatus: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Student user with ID ${studentUserId} not found`);
    }

    const enrollments = await this.getStudentEnrollments(studentUserId, institutionId);

    if (enrollments.length === 0) {
      throw new NotFoundException(`Student is not enrolled in any program at this institution`);
    }

    const progress = await this.getStudentProgress(studentUserId, institutionId);
    const assessments = await this.getStudentAssessmentPerformance(studentUserId, institutionId);
    const credentials = await this.getStudentCredentials(studentUserId, institutionId);

    return {
      student: user,
      enrollments,
      progressOverview: progress,
      assessmentAttempts: assessments,
      credentials,
    };
  }

  async getStudentProgress(studentUserId: string, institutionId: string) {
    const enrollments = await this.getStudentEnrollments(studentUserId, institutionId);
    const programIds = enrollments.map((e) => e.programId);

    const progresses = await this.prisma.progress.findMany({
      where: {
        userId: studentUserId,
        lesson: {
          module: {
            track: {
              programId: { in: programIds },
            },
          },
        },
      },
      include: {
        lesson: {
          select: { id: true, title: true, moduleId: true },
        },
      },
    });

    return enrollments.map((e) => ({
      programId: e.programId,
      programTitle: e.program.title,
      overallProgressPercent: e.progress,
      status: e.status,
      completedLessonsCount: progresses.length,
    }));
  }

  async getStudentEnrollments(studentUserId: string, institutionId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        userId: studentUserId,
        program: { institutionId },
      },
      include: {
        program: { select: { id: true, title: true, description: true } },
        mentor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async getStudentAssessmentPerformance(studentUserId: string, institutionId: string) {
    return this.prisma.assessmentAttempt.findMany({
      where: {
        userId: studentUserId,
        assessment: {
          module: {
            track: {
              program: { institutionId },
            },
          },
        },
      },
      include: {
        assessment: { select: { id: true, title: true, passingScore: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getStudentCredentials(studentUserId: string, institutionId: string) {
    return this.prisma.credential.findMany({
      where: {
        userId: studentUserId,
        institutionId,
      },
      include: {
        program: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async assignMentor(dto: AssignMentorDto, institutionId: string, adminUserId: string) {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id: dto.facultyId },
    });
    if (!faculty || faculty.institutionId !== institutionId) {
      throw new BadRequestException('Faculty member does not belong to this institution');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: { program: true },
    });
    if (!enrollment || enrollment.program.institutionId !== institutionId) {
      throw new BadRequestException('Enrollment record does not belong to this institution');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: dto.enrollmentId },
      data: { mentorFacultyId: dto.facultyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
        mentor: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.MENTOR_ASSIGNED,
      `Assigned mentor ${dto.facultyId} to student ${enrollment.userId} for program ${enrollment.programId}`,
    );

    return updated;
  }

  async changeMentor(enrollmentId: string, dto: ChangeMentorDto, institutionId: string, adminUserId: string) {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id: dto.newFacultyId },
    });
    if (!faculty || faculty.institutionId !== institutionId) {
      throw new BadRequestException('New faculty member does not belong to this institution');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { program: true },
    });
    if (!enrollment || enrollment.program.institutionId !== institutionId) {
      throw new BadRequestException('Enrollment record does not belong to this institution');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { mentorFacultyId: dto.newFacultyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
        mentor: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.MENTOR_CHANGED,
      `Changed mentor for enrollment ${enrollmentId} to faculty ID ${dto.newFacultyId}`,
    );

    return updated;
  }
}
