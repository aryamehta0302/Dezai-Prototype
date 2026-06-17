import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

// ─── Response Type Interfaces (for documentation + controller import) ─────────

/** Response shape for GET /api/analytics/faculty */
export interface FacultyAnalyticsResponseDto {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
}

/** Response shape for GET /api/analytics/programs/:id */
export interface ProgramAnalyticsResponseDto {
  programId: string;
  programTitle: string;
  totalEnrollments: number;
  activeLearners: number;
  completionPercent: number;
  totalXp: number;
}

/** Single student row in the student metrics table */
export interface StudentMetricDto {
  userId: string;
  name: string;
  email: string;
  institution: string;
  progress: number;
  xp: number;
  lastActiveAt: Date | null;
  enrolledAt: Date;
  completedAt: Date | null;
}

/** Response shape for GET /api/analytics/programs/:id/students */
export interface StudentMetricsResponseDto {
  programId: string;
  programTitle: string;
  institutionName: string;
  totalStudents: number;
  students: StudentMetricDto[];
}

/**
 * AnalyticsService
 *
 * Provides three analytics features:
 * 1. Faculty Analytics  — total students, active students, completion rate
 * 2. Program Analytics  — total enrollments, active learners, completion %, total XP
 * 3. Student Metrics    — per-student: name, institution, progress %, XP
 *
 * All data is derived from existing Prisma models:
 * User, Enrollment, Program, FacultyMember, XpTransaction, Institution
 *
 * Dezai Terminology:
 *   - Program     (not Course)
 *   - Institution (not College)
 *   - Assessment  (not Exam)
 *   - Enrollment  (not Registration)
 */
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // 1. FACULTY ANALYTICS
  //    Aggregates across ALL programs owned by a faculty member.
  //    Called by a logged-in FACULTY user using their own userId.
  // ─────────────────────────────────────────────────────────────────────────
  async getFacultyAnalytics(userId: string) {
    // Step 1: Resolve the FacultyMember record from the userId
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!facultyMember) {
      throw new NotFoundException('Faculty profile not found for this user');
    }

    // Step 2: Define the 30-day active window
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Step 3: Count ALL students enrolled in any program owned by this faculty
    const totalStudents = await this.prisma.enrollment.count({
      where: {
        program: { facultyId: facultyMember.id },
      },
    });

    // Step 4: Count ACTIVE students (lastActiveAt within last 30 days)
    const activeStudents = await this.prisma.enrollment.count({
      where: {
        program: { facultyId: facultyMember.id },
        user: { lastActiveAt: { gte: thirtyDaysAgo } },
      },
    });

    // Step 5: Count COMPLETED enrollments (completedAt is set)
    const completedEnrollments = await this.prisma.enrollment.count({
      where: {
        program: { facultyId: facultyMember.id },
        completedAt: { not: null },
      },
    });

    // Step 6: Completion rate — guard against divide-by-zero
    const completionRate =
      totalStudents > 0
        ? Math.round((completedEnrollments / totalStudents) * 100)
        : 0;

    const result: FacultyAnalyticsResponseDto = {
      totalStudents,
      activeStudents,
      completionRate,
    };

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. PROGRAM ANALYTICS
  //    Aggregates for a single Program by its ID.
  //    Includes total XP earned by all students in that program.
  // ─────────────────────────────────────────────────────────────────────────
  async getProgramAnalytics(programId: string) {
    // Step 1: Verify program exists
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, title: true },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID "${programId}" not found`);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Step 2: Total enrollments in this program
    const totalEnrollments = await this.prisma.enrollment.count({
      where: { programId },
    });

    // Step 3: Active learners — enrolled students active in last 30 days
    const activeLearners = await this.prisma.enrollment.count({
      where: {
        programId,
        user: { lastActiveAt: { gte: thirtyDaysAgo } },
      },
    });

    // Step 4: Completed enrollments
    const completedCount = await this.prisma.enrollment.count({
      where: {
        programId,
        completedAt: { not: null },
      },
    });

    // Step 5: Completion percentage — guard against divide-by-zero
    const completionPercent =
      totalEnrollments > 0
        ? Math.round((completedCount / totalEnrollments) * 100)
        : 0;

    // Step 6: Total XP earned by all students in this program
    //         Pull enrolled userIds first, then aggregate XpTransaction
    const programEnrollments = await this.prisma.enrollment.findMany({
      where: { programId },
      select: { userId: true },
    });
    const userIds = programEnrollments.map((e) => e.userId);

    let totalXp = 0;
    if (userIds.length > 0) {
      const xpResult = await this.prisma.xpTransaction.aggregate({
        where: { userId: { in: userIds } },
        _sum: { amount: true },
      });
      totalXp = xpResult._sum.amount ?? 0;
    }

    const result: ProgramAnalyticsResponseDto = {
      programId: program.id,
      programTitle: program.title,
      totalEnrollments,
      activeLearners,
      completionPercent,
      totalXp,
    };

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. STUDENT METRICS TABLE
  //    Per-student breakdown for a given Program.
  //    Returns name, institution, progress %, XP for each enrolled student.
  //
  //    OPTIMIZED: Institution is fetched ONCE from the program lookup (Step 1),
  //    not repeated per enrollment row — avoids redundant nested joins.
  // ─────────────────────────────────────────────────────────────────────────
  async getStudentMetrics(programId: string) {
    // Step 1: Verify program exists and fetch institution name in one query
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        institution: {
          select: { name: true },
        },
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID "${programId}" not found`);
    }

    // Institution name resolved ONCE here — not repeated per student row
    const institutionName: string = program.institution
      ? program.institution.name
      : 'Unknown Institution';

    // Step 2: Fetch all enrollments with only student-specific data
    //         (No need to re-include program/institution — already resolved above)
    const enrollments = await this.prisma.enrollment.findMany({
      where: { programId },
      select: {
        progress: true,
        createdAt: true,
        completedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
            lastActiveAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Step 3: Return empty list if no enrollments (valid scenario — not an error)
    if (enrollments.length === 0) {
      const emptyResult: StudentMetricsResponseDto = {
        programId: program.id,
        programTitle: program.title,
        institutionName,
        totalStudents: 0,
        students: [],
      };
      return emptyResult;
    }

    // Step 4: Shape each record into a clean StudentMetricDto object
    const students: StudentMetricDto[] = enrollments.map((e) => ({
      userId: e.user.id,
      name: e.user.name ? e.user.name : 'Unknown',  // fallback for null names
      email: e.user.email,
      institution: institutionName,                   // same for all students in this program
      progress: e.progress,                           // 0–100, stored in Enrollment model
      xp: e.user.xp,                                 // running total on User model
      lastActiveAt: e.user.lastActiveAt ? e.user.lastActiveAt : null,
      enrolledAt: e.createdAt,
      completedAt: e.completedAt ? e.completedAt : null,
    }));

    const result: StudentMetricsResponseDto = {
      programId: program.id,
      programTitle: program.title,
      institutionName,
      totalStudents: students.length,
      students,
    };

    return result;
  }
}
