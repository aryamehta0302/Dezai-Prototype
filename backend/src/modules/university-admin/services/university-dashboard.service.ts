import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FacultyVerificationStatus, AccountStatus } from '@prisma/client';
import { UniversityDashboardDto } from '../dto/university-dashboard.dto';

@Injectable()
export class UniversityDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview(institutionId: string): Promise<UniversityDashboardDto> {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!institution) {
      throw new NotFoundException(`Institution with ID ${institutionId} not found`);
    }

    const [
      totalFaculty,
      pendingFacultyApprovals,
      activeFaculty,
      suspendedFaculty,
    ] = await Promise.all([
      this.prisma.facultyMember.count({ where: { institutionId } }),
      this.prisma.facultyMember.count({
        where: { institutionId, verificationStatus: FacultyVerificationStatus.PENDING },
      }),
      this.prisma.facultyMember.count({
        where: {
          institutionId,
          verificationStatus: FacultyVerificationStatus.APPROVED,
          user: { accountStatus: AccountStatus.ACTIVE },
        },
      }),
      this.prisma.facultyMember.count({
        where: {
          institutionId,
          user: { accountStatus: AccountStatus.SUSPENDED },
        },
      }),
    ]);

    const programs = await this.prisma.program.findMany({
      where: { institutionId },
      select: { id: true },
    });
    const programIds = programs.map((p) => p.id);

    const [totalStudents, activeEnrollments, completedPrograms] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['userId'],
        where: { programId: { in: programIds } },
      }).then((res) => res.length),
      this.prisma.enrollment.count({
        where: { programId: { in: programIds }, status: 'ACTIVE' },
      }),
      this.prisma.enrollment.count({
        where: { programId: { in: programIds }, status: 'COMPLETED' },
      }),
    ]);

    const totalDepartments = await this.prisma.institutionDepartment.count({
      where: { institutionId },
    });
    const totalPrograms = programs.length;
    const activePrograms = totalPrograms;

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
    const assessmentPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const credentialsIssuedThisMonth = await this.prisma.credential.count({
      where: {
        institutionId,
        issuedAt: { gte: startOfMonth },
      },
    });

    const recentActivity = await this.prisma.auditLog.findMany({
      where: {
        user: {
          OR: [
            { facultyInfo: { institutionId } },
            { instAdminInfo: { institutionId } },
          ],
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return {
      totalFaculty,
      pendingFacultyApprovals,
      activeFaculty,
      suspendedFaculty,
      totalStudents,
      activeEnrollments,
      completedPrograms,
      totalDepartments,
      totalPrograms,
      activePrograms,
      assessmentPassRate,
      credentialsIssuedThisMonth,
      institutionStatus: institution.status,
      recentActivity,
    };
  }
}
