import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
      verificationStatus: facultyMember.verificationStatus,
      user: facultyMember.user,
      institution: facultyMember.institution,
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

    // Run database transactions to update User and FacultyMember
    return this.prisma.$transaction(async (tx) => {
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
  }
}
