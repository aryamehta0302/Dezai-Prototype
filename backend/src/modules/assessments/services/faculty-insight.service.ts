import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditAction, Difficulty } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { WeakTopicDetectionService } from './weak-topic-detection.service';
import type {
  AtRiskStudent,
  LowProgressStudent,
  InactiveStudent,
  AcademicHealthResult,
  FacultyInsightDashboard,
  RepeatedFailureResult,
  AssessmentFailurePattern,
  StudentDetailInsight,
} from '../dto/faculty-insight.dto';

// ─────────────────── CONSTANTS ───────────────────

/** Students who have failed the same assessment >= this many times are "at-risk". */
const AT_RISK_FAIL_THRESHOLD = 2;

/** Enrollment progress at or below this percentage marks a student as "low progress". */
const LOW_PROGRESS_THRESHOLD = 30;

/** Days without activity to be considered "inactive". */
const INACTIVE_DAYS_THRESHOLD = 7;

/** Milliseconds per day. */
const MS_PER_DAY = 86400000;

// ─────────────────── INTERNAL TYPES ───────────────────

interface FacultyStudentInfo {
  userId: string;
  userName: string;
  email: string;
  lastActiveAt: Date | null;
  streakCount: number;
  xp: number;
  enrollments: {
    programId: string;
    programTitle: string;
    progress: number;
    createdAt: Date;
  }[];
}

// ─────────────────── SERVICE ───────────────────

/**
 * FacultyInsightService — Sprint 6 Tasks B1 + B2 + B3
 *
 * Provides at-risk student detection, low-progress monitoring, inactive
 * student alerts, academic health scoring, repeated failure analysis,
 * and detailed per-student insight views for faculty dashboards.
 */
@Injectable()
export class FacultyInsightService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly weakTopicDetectionService: WeakTopicDetectionService,
  ) {}

  // ─────────────────── TASK B1: AT-RISK STUDENTS ───────────────────

  /**
   * Students who have failed the same assessment >= AT_RISK_FAIL_THRESHOLD times.
   * Faculty can only see students enrolled in their own programs.
   */
  async getAtRiskStudents(facultyUserId: string): Promise<AtRiskStudent[]> {
    const { faculty, studentUserIds } =
      await this.getFacultyStudentIds(facultyUserId);

    if (studentUserIds.length === 0) return [];

    // Audit log
    await this.auditService.logAction(
      facultyUserId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `FacultyInsightAccess: type=atRisk, facultyId=${facultyUserId}`,
    );

    // Fetch all completed attempts for these students
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        userId: { in: studentUserIds },
        completedAt: { not: null },
        passed: false,
      },
      include: {
        user: { select: { name: true, email: true } },
        assessment: { select: { id: true, title: true, sampleSize: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Group by userId + assessmentId to count failures
    const failMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        assessmentId: string;
        assessmentTitle: string;
        failCount: number;
        lastAttemptDate: Date;
        lastScore: number;
      }
    >();

    for (const attempt of attempts) {
      const key = `${attempt.userId}::${attempt.assessmentId}`;

      if (!failMap.has(key)) {
        failMap.set(key, {
          userId: attempt.userId,
          userName: attempt.user.name ?? attempt.user.email,
          assessmentId: attempt.assessmentId,
          assessmentTitle: attempt.assessment.title,
          failCount: 0,
          lastAttemptDate: attempt.completedAt!,
          lastScore: attempt.score > attempt.assessment.sampleSize
            ? attempt.score
            : Math.round((attempt.score / attempt.assessment.sampleSize) * 100),
        });
      }

      failMap.get(key)!.failCount++;
    }

    // Filter by threshold
    return Array.from(failMap.values())
      .filter((entry) => entry.failCount >= AT_RISK_FAIL_THRESHOLD)
      .sort((a, b) => b.failCount - a.failCount);
  }

  // ─────────────────── TASK B1: LOW PROGRESS STUDENTS ───────────────────

  /**
   * Students with Enrollment.progress <= LOW_PROGRESS_THRESHOLD
   * in the faculty's programs.
   */
  async getLowProgressStudents(
    facultyUserId: string,
  ): Promise<LowProgressStudent[]> {
    const faculty = await this.getFacultyMember(facultyUserId);

    await this.auditService.logAction(
      facultyUserId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `FacultyInsightAccess: type=lowProgress, facultyId=${facultyUserId}`,
    );

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        program: { facultyId: faculty.id },
        progress: { lte: LOW_PROGRESS_THRESHOLD },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
      },
    });

    const now = Date.now();

    return enrollments.map((e) => ({
      userId: e.user.id,
      userName: e.user.name ?? e.user.email,
      programId: e.program.id,
      programTitle: e.program.title,
      progressPercent: e.progress,
      enrolledAt: e.createdAt,
      daysSinceEnrollment: Math.floor(
        (now - e.createdAt.getTime()) / MS_PER_DAY,
      ),
    }));
  }

  // ─────────────────── TASK B1: INACTIVE STUDENTS ───────────────────

  /**
   * Students who haven't been active for INACTIVE_DAYS_THRESHOLD days
   * and are enrolled in faculty's programs.
   */
  async getInactiveStudents(
    facultyUserId: string,
  ): Promise<InactiveStudent[]> {
    const faculty = await this.getFacultyMember(facultyUserId);

    await this.auditService.logAction(
      facultyUserId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `FacultyInsightAccess: type=inactive, facultyId=${facultyUserId}`,
    );

    const cutoffDate = new Date(Date.now() - INACTIVE_DAYS_THRESHOLD * MS_PER_DAY);

    const staleStudents = await this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
        OR: [
          { lastActiveAt: { lt: cutoffDate } },
          { lastActiveAt: null },
        ],
        enrollments: {
          some: { program: { facultyId: faculty.id } },
        },
      },
      include: {
        enrollments: {
          where: { program: { facultyId: faculty.id } },
          include: { program: { select: { title: true } } },
        },
      },
    });

    const now = Date.now();

    return staleStudents.map((student) => ({
      userId: student.id,
      userName: student.name ?? student.email,
      lastActiveAt: student.lastActiveAt,
      daysInactive: student.lastActiveAt
        ? Math.floor((now - student.lastActiveAt.getTime()) / MS_PER_DAY)
        : Math.floor((now - student.createdAt.getTime()) / MS_PER_DAY),
      enrolledPrograms: student.enrollments.map((e) => e.program.title),
    }));
  }

  // ─────────────────── TASK B1: ACADEMIC HEALTH ───────────────────

  /**
   * Aggregated academic health score per student (0–100 composite).
   *
   * Components:
   * - assessmentPassRate (0–100): passed attempts / total attempts * 100
   * - progressRate (0–100): average Enrollment.progress across programs
   * - activityScore (0–100): 100 if active today, decreases by 10/day
   * - streakScore (0–100): streakCount / 30 * 100, capped at 100
   *
   * Risk levels: LOW (>=70) | MEDIUM (40-69) | HIGH (<40)
   */
  async getStudentAcademicHealth(
    studentUserId: string,
    facultyUserId: string,
  ): Promise<AcademicHealthResult> {
    await this.validateStudentInFacultyPrograms(studentUserId, facultyUserId);

    await this.auditService.logAction(
      facultyUserId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `FacultyInsightAccess: type=academicHealth, facultyId=${facultyUserId}, studentId=${studentUserId}`,
    );

    const student = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      include: {
        enrollments: { select: { progress: true } },
        attempts: {
          where: { completedAt: { not: null } },
          select: { passed: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Assessment pass rate
    const totalAttempts = student.attempts.length;
    const passedAttempts = student.attempts.filter((a) => a.passed).length;
    const assessmentPassRate = totalAttempts > 0
      ? this.round((passedAttempts / totalAttempts) * 100)
      : 100; // No attempts yet → not penalized

    // Progress rate (average enrollment progress)
    const enrollmentProgresses = student.enrollments.map((e) => e.progress);
    const progressRate = enrollmentProgresses.length > 0
      ? this.round(
          enrollmentProgresses.reduce((a, b) => a + b, 0) /
            enrollmentProgresses.length,
        )
      : 0;

    // Activity score (100 if active today, decreases by 10 per inactive day)
    const daysInactive = student.lastActiveAt
      ? Math.floor(
          (Date.now() - student.lastActiveAt.getTime()) / MS_PER_DAY,
        )
      : 30; // No lastActiveAt → treat as very inactive
    const activityScore = Math.max(0, 100 - daysInactive * 10);

    // Streak score
    const streakScore = Math.min(100, this.round((student.streakCount / 30) * 100));

    // Composite
    const healthScore = this.round(
      (assessmentPassRate + progressRate + activityScore + streakScore) / 4,
    );

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (healthScore >= 70) riskLevel = 'LOW';
    else if (healthScore >= 40) riskLevel = 'MEDIUM';
    else riskLevel = 'HIGH';

    return {
      userId: studentUserId,
      healthScore,
      components: {
        assessmentPassRate,
        progressRate,
        activityScore,
        streakScore,
      },
      riskLevel,
    };
  }

  // ─────────────────── TASK B1: FACULTY INSIGHT DASHBOARD ───────────────────

  /**
   * All three risk categories combined in a single dashboard response.
   */
  async getFacultyInsightDashboard(
    facultyUserId: string,
  ): Promise<FacultyInsightDashboard> {
    const [atRiskStudents, lowProgressStudents, inactiveStudents] =
      await Promise.all([
        this.getAtRiskStudents(facultyUserId),
        this.getLowProgressStudents(facultyUserId),
        this.getInactiveStudents(facultyUserId),
      ]);

    // Count unique students across all lists
    const allStudentIds = new Set<string>();
    for (const s of atRiskStudents) allStudentIds.add(s.userId);
    for (const s of lowProgressStudents) allStudentIds.add(s.userId);
    for (const s of inactiveStudents) allStudentIds.add(s.userId);

    return {
      atRiskStudents,
      lowProgressStudents,
      inactiveStudents,
      summary: {
        totalAtRisk: atRiskStudents.length,
        totalLowProgress: lowProgressStudents.length,
        totalInactive: inactiveStudents.length,
        totalStudentsMonitored: allStudentIds.size,
      },
    };
  }

  // ─────────────────── TASK B2: REPEATED FAILURE DETECTION ───────────────────

  /**
   * Students with repeated failures, optionally scoped to one assessment.
   * Includes consecutive failure streak count.
   */
  async getRepeatedFailureStudents(
    facultyUserId: string,
    assessmentId?: string,
  ): Promise<RepeatedFailureResult[]> {
    const { studentUserIds } =
      await this.getFacultyStudentIds(facultyUserId);

    if (studentUserIds.length === 0) return [];

    await this.auditService.logAction(
      facultyUserId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `FacultyInsightAccess: type=repeatedFailures, facultyId=${facultyUserId}, assessmentId=${assessmentId ?? 'all'}`,
    );

    const whereClause: any = {
      userId: { in: studentUserIds },
      completedAt: { not: null },
    };

    if (assessmentId) {
      whereClause.assessmentId = assessmentId;
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        assessment: { select: { id: true, title: true, sampleSize: true } },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Group by userId + assessmentId
    const groupMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        assessmentId: string;
        assessmentTitle: string;
        attempts: { passed: boolean; score: number; completedAt: Date }[];
      }
    >();

    for (const attempt of attempts) {
      const key = `${attempt.userId}::${attempt.assessmentId}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          userId: attempt.userId,
          userName: attempt.user.name ?? attempt.user.email,
          assessmentId: attempt.assessmentId,
          assessmentTitle: attempt.assessment.title,
          attempts: [],
        });
      }

      groupMap.get(key)!.attempts.push({
        passed: attempt.passed,
        score: attempt.score > attempt.assessment.sampleSize
          ? attempt.score
          : Math.round((attempt.score / attempt.assessment.sampleSize) * 100),
        completedAt: attempt.completedAt!,
      });
    }

    const results: RepeatedFailureResult[] = [];

    for (const group of groupMap.values()) {
      const failedAttempts = group.attempts.filter((a) => !a.passed).length;
      if (failedAttempts < AT_RISK_FAIL_THRESHOLD) continue;

      // Calculate consecutive failures from most recent
      let consecutiveFailures = 0;
      for (let i = group.attempts.length - 1; i >= 0; i--) {
        if (!group.attempts[i].passed) {
          consecutiveFailures++;
        } else {
          break;
        }
      }

      const totalAttempts = group.attempts.length;
      const avgScore = this.round(
        group.attempts.reduce((s, a) => s + a.score, 0) / totalAttempts,
      );
      const lastAttempt = group.attempts[group.attempts.length - 1];

      results.push({
        userId: group.userId,
        userName: group.userName,
        assessmentId: group.assessmentId,
        assessmentTitle: group.assessmentTitle,
        totalAttempts,
        failedAttempts,
        failRate: this.round(failedAttempts / totalAttempts),
        consecutiveFailures,
        averageScore: avgScore,
        lastAttemptDate: lastAttempt.completedAt,
      });
    }

    return results.sort((a, b) => b.consecutiveFailures - a.consecutiveFailures);
  }

  // ─────────────────── TASK B2: FAILURE PATTERN BY ASSESSMENT ───────────────────

  /**
   * Assessment-level failure analysis: common weak categories among
   * failing students, difficulty concentration, and average attempts before pass.
   */
  async getFailurePatternByAssessment(
    assessmentId: string,
    facultyUserId: string,
  ): Promise<AssessmentFailurePattern> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { id: true, title: true },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`,
      );
    }

    await this.auditService.logAction(
      facultyUserId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `FacultyInsightAccess: type=failurePattern, facultyId=${facultyUserId}, assessmentId=${assessmentId}`,
    );

    // Fetch all completed attempts
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      select: { userId: true, passed: true },
      orderBy: { completedAt: 'asc' },
    });

    // Count students with repeated failures
    const failCountByUser = new Map<string, number>();
    const attemptsBeforePassByUser = new Map<string, number>();

    for (const attempt of attempts) {
      if (!attempt.passed) {
        failCountByUser.set(
          attempt.userId,
          (failCountByUser.get(attempt.userId) ?? 0) + 1,
        );
      } else {
        // Record attempts before first pass
        if (!attemptsBeforePassByUser.has(attempt.userId)) {
          attemptsBeforePassByUser.set(
            attempt.userId,
            failCountByUser.get(attempt.userId) ?? 0,
          );
        }
      }
    }

    const studentsWithRepeatedFailures = Array.from(
      failCountByUser.values(),
    ).filter((count) => count >= AT_RISK_FAIL_THRESHOLD).length;

    // Average attempts before pass
    let averageAttemptsBeforePass: number | null = null;
    if (attemptsBeforePassByUser.size > 0) {
      const totalBeforePass = Array.from(
        attemptsBeforePassByUser.values(),
      ).reduce((a, b) => a + b, 0);
      averageAttemptsBeforePass = this.round(
        totalBeforePass / attemptsBeforePassByUser.size,
      );
    }

    // Analyse wrong answers from failing students for category and difficulty
    const failingStudentIds = Array.from(failCountByUser.entries())
      .filter(([, count]) => count >= AT_RISK_FAIL_THRESHOLD)
      .map(([userId]) => userId);

    const wrongAnswers = await this.prisma.attemptAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: {
          assessmentId,
          completedAt: { not: null },
          userId: { in: failingStudentIds },
        },
      },
      include: {
        question: {
          select: { category: true, difficulty: true },
        },
      },
    });

    // Category frequency
    const categoryCounts = new Map<string, number>();
    const difficultyCounts: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
    let totalWrongAnswers = 0;

    for (const ans of wrongAnswers) {
      totalWrongAnswers++;
      const cat = ans.question.category ?? 'Uncategorised';
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
      difficultyCounts[ans.question.difficulty] =
        (difficultyCounts[ans.question.difficulty] ?? 0) + 1;
    }

    // Top 5 weak categories
    const commonWeakCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    // Difficulty concentration as percentages
    const failureConcentrationByDifficulty = {
      EASY: totalWrongAnswers > 0
        ? this.round((difficultyCounts.EASY / totalWrongAnswers) * 100)
        : 0,
      MEDIUM: totalWrongAnswers > 0
        ? this.round((difficultyCounts.MEDIUM / totalWrongAnswers) * 100)
        : 0,
      HARD: totalWrongAnswers > 0
        ? this.round((difficultyCounts.HARD / totalWrongAnswers) * 100)
        : 0,
    };

    return {
      assessmentId,
      assessmentTitle: assessment.title,
      studentsWithRepeatedFailures,
      averageAttemptsBeforePass,
      commonWeakCategories,
      failureConcentrationByDifficulty,
    };
  }

  // ─────────────────── TASK B3: STUDENT DETAIL INSIGHT ───────────────────

  /**
   * Full per-student view for faculty — combines enrollment data,
   * assessment stats, academic health, and weak topics.
   */
  async getStudentDetailInsight(
    studentUserId: string,
    facultyUserId: string,
  ): Promise<StudentDetailInsight> {
    await this.validateStudentInFacultyPrograms(studentUserId, facultyUserId);

    await this.auditService.logAction(
      facultyUserId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `FacultyInsightAccess: type=studentDetail, facultyId=${facultyUserId}, studentId=${studentUserId}`,
    );

    const student = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      include: {
        enrollments: {
          include: { program: { select: { id: true, title: true } } },
        },
        attempts: {
          where: { completedAt: { not: null } },
          select: {
            passed: true,
            score: true,
            assessment: { select: { sampleSize: true } },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Enrolled programs
    const enrolledPrograms = student.enrollments.map((e) => ({
      programId: e.program.id,
      programTitle: e.program.title,
      progress: e.progress,
      enrolledAt: e.createdAt,
    }));

    // Assessment stats
    const totalAttempts = student.attempts.length;
    const passedAttempts = student.attempts.filter((a) => a.passed).length;
    let sumPercentage = 0;
    for (const a of student.attempts) {
      sumPercentage += a.score > a.assessment.sampleSize
        ? a.score
        : Math.round((a.score / a.assessment.sampleSize) * 100);
    }
    const avgScore = totalAttempts > 0
      ? this.round(sumPercentage / totalAttempts)
      : 0;

    // Weak topics (global)
    const weakTopics = await this.weakTopicDetectionService.getStudentGlobalWeakTopics(
      studentUserId,
    );
    const weakTopicNames = weakTopics
      .filter((t) => t.isWeak)
      .map((t) => t.category);

    // Academic health
    const academicHealth = await this.getStudentAcademicHealth(
      studentUserId,
      facultyUserId,
    );

    return {
      userId: student.id,
      userName: student.name ?? student.email,
      email: student.email,
      enrolledPrograms,
      assessmentStats: {
        totalAttempts,
        passedAttempts,
        passRate: totalAttempts > 0
          ? this.round((passedAttempts / totalAttempts) * 100)
          : 0,
        averageScore: avgScore,
        weakTopics: weakTopicNames,
      },
      academicHealth,
      xp: student.xp,
      streakCount: student.streakCount,
      lastActiveAt: student.lastActiveAt,
    };
  }

  // ─────────────────── PRIVATE HELPERS ───────────────────

  /**
   * Resolves the faculty member's FacultyMember record.
   */
  private async getFacultyMember(facultyUserId: string) {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId: facultyUserId },
    });

    if (!faculty) {
      throw new ForbiddenException('Faculty profile not found');
    }

    return faculty;
  }

  /**
   * Resolves all student user IDs enrolled in the faculty's programs.
   * Returns both the faculty record and the list of student IDs.
   */
  private async getFacultyStudentIds(facultyUserId: string) {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId: facultyUserId },
      include: {
        programs: {
          include: {
            enrollments: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!faculty) {
      throw new ForbiddenException('Faculty profile not found');
    }

    const studentUserIds = new Set<string>();
    for (const program of faculty.programs) {
      for (const enrollment of program.enrollments) {
        studentUserIds.add(enrollment.userId);
      }
    }

    return {
      faculty,
      studentUserIds: Array.from(studentUserIds),
    };
  }

  /**
   * Validates that a student is enrolled in at least one of the faculty's programs.
   */
  private async validateStudentInFacultyPrograms(
    studentUserId: string,
    facultyUserId: string,
  ): Promise<void> {
    const faculty = await this.getFacultyMember(facultyUserId);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: studentUserId,
        program: { facultyId: faculty.id },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Student is not enrolled in any of your programs',
      );
    }
  }

  /**
   * Rounds a number to 2 decimal places.
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
