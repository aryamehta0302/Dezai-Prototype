import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─────────────────── FACULTY PROFILE ───────────────────

  /**
   * Get the full faculty profile for the currently authenticated user.
   * Returns user info, institution, department, designation, and verification status.
   */
  async getFacultyProfile(userId: string) {
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            xp: true,
            streakCount: true,
            createdAt: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            country: true,
            state: true,
            city: true,
          },
        },
        programs: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            createdAt: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    if (!facultyMember) {
      throw new NotFoundException(
        'Faculty profile not found for this user. Please complete onboarding first.',
      );
    }

    return {
      id: facultyMember.id,
      department: facultyMember.department,
      designation: facultyMember.designation,
      employeeId: facultyMember.employeeId,
      contactNumber: facultyMember.contactNumber,
      verificationStatus: facultyMember.verificationStatus,
      user: facultyMember.user,
      institution: facultyMember.institution,
      programs: facultyMember.programs,
    };
  }

  // ─────────────────── UNIFIED ROLE-BASED PROFILE ───────────────────

  /**
   * Get the full role-specific profile for the currently authenticated user.
   * Tailored for STUDENT, FACULTY, DEZAI_ADMIN, UNIVERSITY_ADMIN, and ENTERPRISE roles.
   */
  async getUserProfile(userId: string) {
    const user: any = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        facultyInfo: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                country: true,
                state: true,
                city: true,
              },
            },
            programs: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
                createdAt: true,
                _count: { select: { enrollments: true } },
              },
            },
          },
        },
        instAdminInfo: {
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                country: true,
                state: true,
                city: true,
                _count: {
                  select: {
                    faculty: true,
                    programs: true,
                    institutionDepartments: true,
                  },
                },
              },
            },
          },
        },
        enrollments: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
              },
            },
          },
        },
        credentials: {
          where: { verificationStatus: 'ACTIVE' },
          include: {
            program: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role === 'FACULTY' && user.facultyInfo) {
      const faculty = user.facultyInfo;
      const totalPrograms = faculty.programs.length;
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          program: { facultyId: faculty.id },
        },
        select: { userId: true },
        distinct: ['userId'],
      });
      const totalStudents = enrollments.length;

      const pendingAttempts = await this.prisma.assessmentAttempt.count({
        where: {
          completedAt: null,
          assessment: {
            module: {
              track: {
                program: { facultyId: faculty.id },
              },
            },
          },
        },
      });

      return {
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastActiveAt: user.lastActiveAt,
        },
        faculty: {
          id: faculty.id,
          department: faculty.department,
          designation: faculty.designation,
          employeeId: faculty.employeeId,
          contactNumber: faculty.contactNumber,
          verificationStatus: faculty.verificationStatus,
        },
        institution: faculty.institution,
        programs: faculty.programs,
        stats: {
          totalPrograms,
          totalStudents,
          pendingAttempts,
        },
      };
    }

    if (user.role === 'DEZAI_ADMIN') {
      const [totalUsers, totalInstitutions, totalPrograms] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.institution.count(),
        this.prisma.program.count(),
      ]);

      return {
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastActiveAt: user.lastActiveAt,
        },
        admin: {
          roleTitle: 'Platform Super Administrator',
          accessLevel: 'FULL_SYSTEM_ACCESS',
          status: user.accountStatus,
          capabilities: [
            'User & Role Governance',
            'Institution Onboarding & Approvals',
            'System Health & Telemetry',
            'Immutable Audit Trail Inspection',
            'Platform Settings Configuration',
          ],
        },
        stats: {
          totalUsers,
          totalInstitutions,
          totalPrograms,
        },
      };
    }

    if (user.role === 'UNIVERSITY_ADMIN' && user.instAdminInfo) {
      const institution = user.instAdminInfo.institution;
      const studentCount = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          enrollments: {
            some: {
              program: { institutionId: institution.id },
            },
          },
        },
      });

      return {
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastActiveAt: user.lastActiveAt,
        },
        institution: {
          id: institution.id,
          name: institution.name,
          logoUrl: institution.logoUrl,
          country: institution.country,
          state: institution.state,
          city: institution.city,
        },
        stats: {
          totalFaculty: institution._count?.faculty || 0,
          totalPrograms: institution._count?.programs || 0,
          totalDepartments: institution._count?.institutionDepartments || 0,
          totalStudents: studentCount,
        },
      };
    }

    // Default / Student profile
    return {
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        xp: user.xp,
        streakCount: user.streakCount,
      },
      enrollments: user.enrollments,
      credentials: user.credentials,
      stats: {
        enrolledCourses: user.enrollments.length,
        completedCourses: user.enrollments.filter((e) => e.status === 'COMPLETED').length,
        certificatesEarned: user.credentials.length,
        xpEarned: user.xp,
        learningStreak: user.streakCount,
      },
    };
  }

  // ─────────────────── FACULTY DASHBOARD STATS ───────────────────

  /**
   * Get summary dashboard statistics for a faculty member.
   * Returns program count, total enrolled students, and pending assessment attempts.
   */
  async getFacultyDashboardStats(userId: string) {
    // Resolve the faculty record
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!facultyMember) {
      throw new NotFoundException(
        'Faculty profile not found. Please complete onboarding first.',
      );
    }

    // Count programs where this faculty is assigned
    const totalPrograms = await this.prisma.program.count({
      where: { facultyId: facultyMember.id },
    });

    // Count distinct students enrolled in faculty's programs
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        program: { facultyId: facultyMember.id },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    const totalStudents = enrollments.length;

    // Count assessment attempts submitted but not yet graded (pending review)
    // An attempt is considered "pending" when it was started but completedAt is null
    const pendingAttempts = await this.prisma.assessmentAttempt.count({
      where: {
        completedAt: null,
        assessment: {
          module: {
            track: {
              program: { facultyId: facultyMember.id },
            },
          },
        },
      },
    });

    return {
      facultyId: facultyMember.id,
      verificationStatus: facultyMember.verificationStatus,
      stats: {
        totalPrograms,
        totalStudents,
        pendingAttempts,
      },
    };
  }

  // ─────────────────── UPDATE FACULTY PROFILE ───────────────────

  /**
   * Update the faculty member's profile details.
   * Atomically updates User table (name) and FacultyMember table (department, designation).
   */
  async updateFacultyProfile(userId: string, data: { name?: string; department?: string; designation?: string }) {
    // Check if faculty member exists
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!facultyMember) {
      throw new NotFoundException('Faculty profile not found for this user');
    }

    const changedFields: string[] = [];
    if (data.name) changedFields.push('name');
    if (data.department !== undefined) changedFields.push('department');
    if (data.designation !== undefined) changedFields.push('designation');

    const profile = await this.prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: data.name },
        });
      }

      if (data.department !== undefined || data.designation !== undefined) {
        await tx.facultyMember.update({
          where: { userId },
          data: {
            department: data.department,
            designation: data.designation,
          },
        });
      }

      // Return the newly updated profile
      return tx.facultyMember.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              xp: true,
              streakCount: true,
            },
          },
          institution: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              country: true,
              state: true,
              city: true,
            },
          },
        },
      });
    });

    await this.auditService.logAction(
      userId,
      AuditAction.PROFILE_UPDATED,
      `Faculty profile updated: ${changedFields.length > 0 ? changedFields.join(', ') : 'no fields changed'}`,
    );

    return profile;
  }
}
