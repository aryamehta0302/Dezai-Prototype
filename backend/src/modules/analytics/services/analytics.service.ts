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

/** Response shape for GET /api/analytics/faculty/programs */
export interface FacultyProgramDto {
  id: string;
  title: string;
  institutionName: string;
  totalEnrollments: number;
}

/** Module completion stats */
export interface ModuleCompletionStatDto {
  moduleId: string;
  moduleTitle: string;
  completedCount: number;
  totalStudents: number;
  completionPercent: number;
}

/** Lesson progress item */
export interface LessonProgressDto {
  lessonId: string;
  title: string;
  completed: boolean;
  completedAt: Date | null;
}

/** Module syllabus progress */
export interface ModuleSyllabusDto {
  moduleId: string;
  moduleTitle: string;
  lessons: LessonProgressDto[];
}

/** Track syllabus progress */
export interface TrackSyllabusDto {
  trackId: string;
  trackTitle: string | null;
  trackType: string;
  modules: ModuleSyllabusDto[];
}

/** Assessment attempt entry */
export interface AssessmentAttemptDto {
  id: string;
  assessmentTitle: string;
  score: number;
  passingScore: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  violationCount: number;
}

/** Proctoring violation log entry */
export interface ProctoringViolationDto {
  id: string;
  type: string;
  loggedAt: Date;
  assessmentTitle: string;
}

/** Response shape for GET /api/analytics/programs/:programId/students/:userId */
export interface StudentDetailedProgressResponseDto {
  student: {
    id: string;
    name: string;
    email: string;
    xp: number;
    overallProgress: number;
    completedAt: Date | null;
  };
  syllabus: TrackSyllabusDto[];
  attempts: AssessmentAttemptDto[];
  violations: ProctoringViolationDto[];
}

/** Flagged at-risk student entry */
export interface FlaggedStudentDto {
  userId: string;
  name: string;
  email: string;
  progress: number;
  xp: number;
  lastActiveAt: Date | null;
  healthStatus: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  riskReasons: string[];
}

/** Response shape for GET /api/analytics/programs/:id/insights */
export interface ProgramInsightsResponseDto {
  programId: string;
  programTitle: string;
  averageProgress: number;
  totalStudents: number;
  atRiskCount: number;
  healthyCount: number;
  warningCount: number;
  atRiskStudents: FlaggedStudentDto[];
}

/** Sent intervention outreach entry */
export interface InterventionDto {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  message: string;
  createdAt: Date;
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

  /**
   * getFacultyExtendedAnalytics
   * Calculates total programs, total/active students, completion rate,
   * top/weak students, and difficult modules for a faculty member.
   */
  async getFacultyExtendedAnalytics(userId: string) {
    // 1. Resolve FacultyMember
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });
    if (!facultyMember) {
      throw new NotFoundException('Faculty profile not found for this user');
    }

    // 2. Fetch all programs owned by this faculty
    const programs = await this.prisma.program.findMany({
      where: { facultyId: facultyMember.id },
      select: { id: true, title: true, institution: { select: { name: true } } },
    });
    const programIds = programs.map((p) => p.id);

    if (programIds.length === 0) {
      return {
        totalPrograms: 0,
        totalStudents: 0,
        activeStudents: 0,
        completionRate: 0,
        topStudents: [],
        weakStudents: [],
        difficultModules: [],
      };
    }

    // 3. Overview metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalStudents = await this.prisma.enrollment.count({
      where: { programId: { in: programIds } },
    });
    const activeStudents = await this.prisma.enrollment.count({
      where: {
        programId: { in: programIds },
        user: { lastActiveAt: { gte: thirtyDaysAgo } },
      },
    });
    const completedCount = await this.prisma.enrollment.count({
      where: {
        programId: { in: programIds },
        completedAt: { not: null },
      },
    });
    const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

    // 4. Top Students (highest XP, then highest progress in these programs)
    const topEnrollments = await this.prisma.enrollment.findMany({
      where: { programId: { in: programIds } },
      select: {
        progress: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
          },
        },
        program: { select: { title: true } },
      },
      orderBy: [
        { user: { xp: 'desc' } },
        { progress: 'desc' }
      ],
      take: 5,
    });
    const topStudents = topEnrollments.map((e) => ({
      userId: e.user.id,
      name: e.user.name || 'Unknown Student',
      email: e.user.email,
      xp: e.user.xp,
      progress: e.progress,
      programTitle: e.program.title,
    }));

    // 5. Weak Students (lowest progress)
    const weakEnrollments = await this.prisma.enrollment.findMany({
      where: { programId: { in: programIds } },
      select: {
        progress: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
          },
        },
        program: { select: { title: true } },
      },
      orderBy: { progress: 'asc' },
      take: 5,
    });
    const weakStudents = weakEnrollments.map((e) => ({
      userId: e.user.id,
      name: e.user.name || 'Unknown Student',
      email: e.user.email,
      xp: e.user.xp,
      progress: e.progress,
      programTitle: e.program.title,
    }));

    // 6. Difficult Modules
    // Find all modules in tracks under these programs
    const modules = await this.prisma.module.findMany({
      where: { track: { programId: { in: programIds } } },
      select: {
        id: true,
        title: true,
        track: { select: { program: { select: { title: true } } } },
        assessments: {
          select: {
            id: true,
            title: true,
            sampleSize: true,
            attempts: {
              select: {
                passed: true,
                score: true,
              },
            },
          },
        },
      },
    });

    const difficultModulesList = [];
    for (const mod of modules) {
      let totalAttempts = 0;
      let passedAttempts = 0;
      let totalScore = 0;

      for (const ass of mod.assessments) {
        totalAttempts += ass.attempts.length;
        passedAttempts += ass.attempts.filter((att) => att.passed).length;
        const pctSum = ass.attempts.reduce(
          (sum, att) => {
            const pct = att.score > ass.sampleSize
              ? att.score
              : Math.round((att.score / ass.sampleSize) * 100);
            return sum + pct;
          },
          0,
        );
        totalScore += pctSum;
      }

      if (totalAttempts > 0) {
        const passRate = Math.round((passedAttempts / totalAttempts) * 100);
        const averageScore = Math.round(totalScore / totalAttempts);
        difficultModulesList.push({
          moduleId: mod.id,
          moduleTitle: mod.title,
          programTitle: mod.track.program.title,
          passRate,
          averageScore,
          totalAttempts,
        });
      }
    }

    // Sort by passRate ascending (lowest pass rate is most difficult)
    const difficultModules = difficultModulesList
      .sort((a, b) => a.passRate - b.passRate)
      .slice(0, 5);

    return {
      totalPrograms: programIds.length,
      totalStudents,
      activeStudents,
      completionRate,
      topStudents,
      weakStudents,
      difficultModules,
    };
  }

  /**
   * getFacultyActivityFeed
   * Gathers recent student enrollments, completions, and attempts, sorting chronologically.
   */
  async getFacultyActivityFeed(userId: string) {
    // 1. Resolve FacultyMember
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });
    if (!facultyMember) {
      throw new NotFoundException('Faculty profile not found for this user');
    }

    // 2. Fetch program IDs
    const programs = await this.prisma.program.findMany({
      where: { facultyId: facultyMember.id },
      select: { id: true },
    });
    const programIds = programs.map((p) => p.id);

    if (programIds.length === 0) {
      return [];
    }

    // 3. Fetch recent enrollments
    const recentEnrollments = await this.prisma.enrollment.findMany({
      where: { programId: { in: programIds } },
      select: {
        id: true,
        createdAt: true,
        user: { select: { name: true } },
        program: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // 4. Fetch recent completions
    const recentCompletions = await this.prisma.enrollment.findMany({
      where: {
        programId: { in: programIds },
        completedAt: { not: null },
      },
      select: {
        id: true,
        completedAt: true,
        user: { select: { name: true } },
        program: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 15,
    });

    // 5. Fetch recent assessment attempts
    const recentAttempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessment: {
          module: {
            track: {
              programId: { in: programIds },
            },
          },
        },
      },
      select: {
        id: true,
        startedAt: true,
        completedAt: true,
        score: true,
        passed: true,
        user: { select: { name: true } },
        assessment: { select: { title: true, sampleSize: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 15,
    });

    // 6. Map to a unified feed schema
    const feed = [];

    for (const e of recentEnrollments) {
      feed.push({
        id: `enrollment-${e.id}`,
        type: 'ENROLLMENT',
        timestamp: e.createdAt,
        studentName: e.user.name || 'Unknown Student',
        programTitle: e.program.title,
        detail: `Enrolled in "${e.program.title}"`,
      });
    }

    for (const e of recentCompletions) {
      if (e.completedAt) {
        feed.push({
          id: `completion-${e.id}`,
          type: 'COMPLETION',
          timestamp: e.completedAt,
          studentName: e.user.name || 'Unknown Student',
          programTitle: e.program.title,
          detail: `Completed "${e.program.title}" micro-credential`,
        });
      }
    }

    for (const a of recentAttempts) {
      const sampleSize = a.assessment.sampleSize || 10;
      const pct = a.score > sampleSize ? a.score : Math.round((a.score / sampleSize) * 100);
      feed.push({
        id: `attempt-${a.id}`,
        type: 'SUBMISSION',
        timestamp: a.completedAt || a.startedAt,
        studentName: a.user.name || 'Unknown Student',
        programTitle: a.assessment.title,
        detail: a.completedAt
          ? `Submitted assessment "${a.assessment.title}" — Score: ${pct}% (${a.passed ? 'PASSED' : 'FAILED'})`
          : `Started assessment "${a.assessment.title}"`,
      });
    }

    // 7. Sort combined feed chronologically descending, limit to 15 items
    return feed
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);
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

  // ─────────────────────────────────────────────────────────────────────────
  // 4. GET FACULTY PROGRAMS
  //    Returns a list of all programs taught by a faculty member.
  // ─────────────────────────────────────────────────────────────────────────
  async getFacultyPrograms(userId: string): Promise<FacultyProgramDto[]> {
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!facultyMember) {
      throw new NotFoundException('Faculty profile not found for this user');
    }

    const programs = await this.prisma.program.findMany({
      where: { facultyId: facultyMember.id },
      include: {
        institution: {
          select: { name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    return programs.map((p) => ({
      id: p.id,
      title: p.title,
      institutionName: p.institution ? p.institution.name : 'Unknown Institution',
      totalEnrollments: p._count.enrollments,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. MODULE COMPLETION RATE STATISTICS
  //    Calculates module-by-module completion rates for all students in a Program.
  // ─────────────────────────────────────────────────────────────────────────
  async getModuleCompletionStats(programId: string): Promise<ModuleCompletionStatDto[]> {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });
    if (!program) {
      throw new NotFoundException(`Program with ID "${programId}" not found`);
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { programId },
      select: { userId: true },
    });
    const studentIds = enrollments.map((e) => e.userId);
    const totalStudents = studentIds.length;

    const modules = await this.prisma.module.findMany({
      where: { track: { programId } },
      include: {
        lessons: {
          select: { id: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    const stats: ModuleCompletionStatDto[] = [];
    for (const mod of modules) {
      const lessonIds = mod.lessons.map((l) => l.id);
      let completedCount = 0;

      if (totalStudents > 0 && lessonIds.length > 0) {
        const progresses = await this.prisma.progress.findMany({
          where: {
            userId: { in: studentIds },
            lessonId: { in: lessonIds },
          },
          select: {
            userId: true,
            lessonId: true,
          },
        });

        const studentCompletedLessons = new Map<string, Set<string>>();
        for (const prog of progresses) {
          if (!studentCompletedLessons.has(prog.userId)) {
            studentCompletedLessons.set(prog.userId, new Set());
          }
          studentCompletedLessons.get(prog.userId)!.add(prog.lessonId);
        }

        for (const studentId of studentIds) {
          const completedLessons = studentCompletedLessons.get(studentId);
          if (completedLessons && completedLessons.size === lessonIds.length) {
            completedCount++;
          }
        }
      }

      const completionPercent = totalStudents > 0
        ? Math.round((completedCount / totalStudents) * 100)
        : 0;

      stats.push({
        moduleId: mod.id,
        moduleTitle: mod.title,
        completedCount,
        totalStudents,
        completionPercent,
      });
    }

    return stats;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. STUDENT DETAILED PROGRESS & PROCTORING LOGS
  //    Gets a student's profile, lesson completions, and anti-cheat history.
  // ─────────────────────────────────────────────────────────────────────────
  async getStudentDetailedProgress(programId: string, studentId: string): Promise<StudentDetailedProgressResponseDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_programId: { userId: studentId, programId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
          },
        },
        program: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment for student "${studentId}" in program "${programId}" not found`);
    }

    const tracks = await this.prisma.programTrack.findMany({
      where: { programId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    const allLessonIds: string[] = [];
    tracks.forEach((track) => {
      track.modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
          allLessonIds.push(l.id);
        });
      });
    });

    const studentProgresses = await this.prisma.progress.findMany({
      where: {
        userId: studentId,
        lessonId: { in: allLessonIds },
      },
      select: {
        lessonId: true,
        completedAt: true,
      },
    });

    const progressMap = new Map<string, Date>();
    studentProgresses.forEach((p) => {
      progressMap.set(p.lessonId, p.completedAt);
    });

    const syllabus: TrackSyllabusDto[] = tracks.map((track) => ({
      trackId: track.id,
      trackTitle: track.title,
      trackType: track.type,
      modules: track.modules.map((mod) => ({
        moduleId: mod.id,
        moduleTitle: mod.title,
        lessons: mod.lessons.map((l) => ({
          lessonId: l.id,
          title: l.title,
          completed: progressMap.has(l.id),
          completedAt: progressMap.get(l.id) || null,
        })),
      })),
    }));

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        userId: studentId,
        assessment: {
          module: {
            track: {
              programId,
            },
          },
        },
      },
      include: {
        assessment: {
          select: {
            title: true,
            passingScore: true,
            sampleSize: true,
          },
        },
        _count: {
          select: { violations: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const formattedAttempts: AssessmentAttemptDto[] = attempts.map((att) => {
      const scorePercentage = att.score > att.assessment.sampleSize
        ? att.score
        : Math.round((att.score / att.assessment.sampleSize) * 100);
      return {
        id: att.id,
        assessmentTitle: att.assessment.title,
        score: scorePercentage,
        passingScore: att.assessment.passingScore,
        passed: att.passed,
        startedAt: att.startedAt,
        completedAt: att.completedAt,
        violationCount: att._count.violations,
      };
    });

    const violationLogs = await this.prisma.violationLog.findMany({
      where: {
        userId: studentId,
        attempt: {
          assessment: {
            module: {
              track: {
                programId,
              },
            },
          },
        },
      },
      select: {
        id: true,
        type: true,
        loggedAt: true,
        attempt: {
          select: {
            assessment: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const formattedViolations: ProctoringViolationDto[] = violationLogs.map((v) => ({
      id: v.id,
      type: v.type,
      loggedAt: v.loggedAt,
      assessmentTitle: v.attempt?.assessment?.title || 'Unknown Assessment',
    }));

    return {
      student: {
        id: enrollment.user.id,
        name: enrollment.user.name || 'Unknown Student',
        email: enrollment.user.email,
        xp: enrollment.user.xp,
        overallProgress: enrollment.progress,
        completedAt: enrollment.completedAt,
      },
      syllabus,
      attempts: formattedAttempts,
      violations: formattedViolations,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. GET PROGRAM INSIGHTS (AT-RISK / ACADEMIC HEALTH)
  //    Flags students as CRITICAL / WARNING based on inactivity, low progress,
  //    and repeated quiz failures.
  // ─────────────────────────────────────────────────────────────────────────
  async getProgramInsights(programId: string): Promise<ProgramInsightsResponseDto> {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, title: true },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID "${programId}" not found`);
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { programId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
            lastActiveAt: true,
            attempts: {
              where: {
                assessment: {
                  module: {
                    track: {
                      programId,
                    },
                  },
                },
              },
              select: {
                assessmentId: true,
                passed: true,
              },
            },
          },
        },
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const flaggedStudents: FlaggedStudentDto[] = [];
    let healthyCount = 0;
    let warningCount = 0;
    let atRiskCount = 0;
    let totalProgressSum = 0;

    for (const e of enrollments) {
      totalProgressSum += e.progress;

      const isInactive = !e.user.lastActiveAt || e.user.lastActiveAt < sevenDaysAgo;
      const isLowProgress = e.progress < 25;

      const failuresPerAssessment = new Map<string, number>();
      e.user.attempts.forEach((att) => {
        if (!att.passed) {
          failuresPerAssessment.set(att.assessmentId, (failuresPerAssessment.get(att.assessmentId) ?? 0) + 1);
        }
      });

      let hasRepeatedFailures = false;
      failuresPerAssessment.forEach((count) => {
        if (count >= 2) {
          hasRepeatedFailures = true;
        }
      });

      const riskReasons: string[] = [];
      if (isInactive) {
        const days = e.user.lastActiveAt
          ? Math.floor((Date.now() - e.user.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
          : 'many';
        riskReasons.push(`Inactive for ${days} days`);
      }
      if (isLowProgress) {
        riskReasons.push(`Low syllabus progress (${e.progress}%)`);
      }
      if (hasRepeatedFailures) {
        riskReasons.push('Failed a quiz assessment repeatedly (2+ failed attempts)');
      }

      let healthStatus: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
      if (hasRepeatedFailures || riskReasons.length > 1) {
        healthStatus = 'CRITICAL';
        atRiskCount++;
      } else if (riskReasons.length === 1) {
        healthStatus = 'WARNING';
        warningCount++;
      } else {
        healthyCount++;
      }

      // Add to flagged list if they are not completely healthy
      if (healthStatus !== 'HEALTHY') {
        flaggedStudents.push({
          userId: e.user.id,
          name: e.user.name || 'Unknown Student',
          email: e.user.email,
          progress: e.progress,
          xp: e.user.xp,
          lastActiveAt: e.user.lastActiveAt,
          healthStatus,
          riskReasons,
        });
      }
    }

    // Sort flagged students so CRITICAL is first, then by progress ascending
    flaggedStudents.sort((a, b) => {
      if (a.healthStatus === 'CRITICAL' && b.healthStatus !== 'CRITICAL') return -1;
      if (a.healthStatus !== 'CRITICAL' && b.healthStatus === 'CRITICAL') return 1;
      return a.progress - b.progress;
    });

    const averageProgress = enrollments.length > 0
      ? Math.round(totalProgressSum / enrollments.length)
      : 0;

    return {
      programId: program.id,
      programTitle: program.title,
      averageProgress,
      totalStudents: enrollments.length,
      atRiskCount,
      healthyCount,
      warningCount,
      atRiskStudents: flaggedStudents,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. LOG FACULTY INTERVENTION OUTREACH
  //    Creates a student notification reminder and registers an audit log.
  // ─────────────────────────────────────────────────────────────────────────
  async createIntervention(
    programId: string,
    facultyUserId: string,
    studentUserId: string,
    message: string,
  ): Promise<any> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_programId: { userId: studentUserId, programId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Student is not enrolled in program with ID "${programId}"`);
    }

    // Create the outreach reminder notification for the student
    const notification = await this.prisma.notification.create({
      data: {
        userId: studentUserId,
        title: '[Intervention] Outreach from your Instructor',
        message,
        type: 'REMINDER',
        read: false,
        archived: false,
      },
    });

    // Write audit log entry
    await this.prisma.auditLog.create({
      data: {
        userId: facultyUserId,
        action: 'PROGRAM_UPDATED',
        details: JSON.stringify({
          type: 'INTERVENTION',
          studentId: studentUserId,
          programId,
          message,
        }),
      },
    });

    return notification;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. GET SENT INTERVENTIONS HISTORY
  //    Returns a list of all logged intervention messages for this program.
  // ─────────────────────────────────────────────────────────────────────────
  async getInterventionsList(programId: string): Promise<InterventionDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        type: 'REMINDER',
        title: '[Intervention] Outreach from your Instructor',
        user: {
          enrollments: {
            some: {
              programId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => ({
      id: n.id,
      studentId: n.user.id,
      studentName: n.user.name || 'Unknown Student',
      studentEmail: n.user.email,
      message: n.message,
      createdAt: n.createdAt,
    }));
  }
}
