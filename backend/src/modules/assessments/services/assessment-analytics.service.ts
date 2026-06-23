import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Difficulty, UserRole } from '@prisma/client';
import { AssessmentService } from './assessment.service';
import type {
  DifficultyBreakdown,
  DifficultyStats,
  AssessmentTrendPoint,
  AssessmentPerformanceReport,
  FacultyInsightSummary,
  FacultyAssessmentInsightItem,
  InstitutionAssessmentSummary,
} from '../dto/intelligence.dto';

// ─────────────────── INTERNAL TYPES ───────────────────

/** Minimal shape of an attempt answer with question difficulty. */
interface AnswerForDifficulty {
  isCorrect: boolean;
  question: {
    id: string;
    text: string;
    category: string | null;
    difficulty: Difficulty;
  };
}

/** Minimal shape for trend computation. */
interface CompletedAttemptForTrend {
  score: number;
  passed: boolean;
  completedAt: Date;
  userId: string;
  sampleSize: number;
}

// ─────────────────── SERVICE ───────────────────

/**
 * AssessmentAnalyticsService — Sprint 6 Tasks A3 + A4
 *
 * Provides difficulty-based performance breakdowns, daily trend analysis,
 * comprehensive performance reports, and faculty/institution-level summaries.
 */
@Injectable()
export class AssessmentAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assessmentService: AssessmentService,
  ) {}

  // ─────────────────── TASK A3: DIFFICULTY BREAKDOWN ───────────────────

  /**
   * Breakdown of performance grouped by question difficulty (EASY/MEDIUM/HARD).
   */
  async getDifficultyBreakdown(
    assessmentId: string,
  ): Promise<DifficultyBreakdown> {
    await this.validateAssessmentExists(assessmentId);

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          assessmentId,
          completedAt: { not: null },
        },
      },
      include: {
        question: {
          select: { id: true, text: true, category: true, difficulty: true },
        },
      },
    });

    const buckets: Record<string, DifficultyStats> = {
      EASY: { totalQuestions: 0, totalAnswered: 0, correctAnswers: 0, accuracyRate: 0 },
      MEDIUM: { totalQuestions: 0, totalAnswered: 0, correctAnswers: 0, accuracyRate: 0 },
      HARD: { totalQuestions: 0, totalAnswered: 0, correctAnswers: 0, accuracyRate: 0 },
    };

    // Track unique questions per difficulty for totalQuestions count
    const uniqueQuestionsByDifficulty: Record<string, Set<string>> = {
      EASY: new Set(),
      MEDIUM: new Set(),
      HARD: new Set(),
    };

    for (const ans of answers as AnswerForDifficulty[]) {
      const diff = ans.question.difficulty;
      const bucket = buckets[diff];
      if (!bucket) continue;

      bucket.totalAnswered++;
      if (ans.isCorrect) bucket.correctAnswers++;
      uniqueQuestionsByDifficulty[diff].add(ans.question.id);
    }

    // Set totalQuestions and compute accuracy
    for (const diff of Object.keys(buckets)) {
      buckets[diff].totalQuestions = uniqueQuestionsByDifficulty[diff].size;
      buckets[diff].accuracyRate = buckets[diff].totalAnswered > 0
        ? this.round(buckets[diff].correctAnswers / buckets[diff].totalAnswered)
        : 0;
    }

    return {
      EASY: buckets.EASY,
      MEDIUM: buckets.MEDIUM,
      HARD: buckets.HARD,
    };
  }

  // ─────────────────── TASK A3: ASSESSMENT TREND ───────────────────

  /**
   * Assessment performance over time — aggregated per calendar date.
   * Returns daily attempt counts, average score, and pass rate.
   */
  async getAssessmentTrend(
    assessmentId: string,
  ): Promise<AssessmentTrendPoint[]> {
    await this.validateAssessmentExists(assessmentId);

    const attempts = await this.fetchCompletedAttempts(assessmentId);

    // Group by date string (YYYY-MM-DD)
    const dateMap = new Map<
      string,
      { scores: number[]; passed: number; total: number }
    >();

    for (const attempt of attempts) {
      const dateKey = attempt.completedAt.toISOString().split('T')[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { scores: [], passed: 0, total: 0 });
      }

      const bucket = dateMap.get(dateKey)!;
      const pct = attempt.score > attempt.sampleSize
        ? attempt.score
        : Math.round((attempt.score / attempt.sampleSize) * 100);
      bucket.scores.push(pct);
      bucket.total++;
      if (attempt.passed) bucket.passed++;
    }

    const trend: AssessmentTrendPoint[] = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        attemptsOnDate: data.total,
        averageScoreOnDate: this.round(
          data.scores.reduce((a, b) => a + b, 0) / data.total,
        ),
        passRateOnDate: this.round(data.passed / data.total),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trend;
  }

  // ─────────────────── TASK A3: PERFORMANCE REPORT ───────────────────

  /**
   * Full performance report combining pass rate, difficulty breakdown,
   * trend, and top 5 missed questions.
   */
  async getAssessmentPerformanceReport(
    assessmentId: string,
  ): Promise<AssessmentPerformanceReport> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { id: true, title: true, sampleSize: true, passingScore: true },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`,
      );
    }

    const attempts = await this.fetchCompletedAttempts(assessmentId);
    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(attempts.map((a) => a.userId)).size;

    let overallPassRate = 0;
    let overallAverageScore = 0;

    if (totalAttempts > 0) {
      const passedCount = attempts.filter((a) => a.passed).length;
      overallPassRate = this.round(passedCount / totalAttempts);
      let sumPercentage = 0;
      for (const a of attempts) {
        sumPercentage += a.score > a.sampleSize
          ? a.score
          : Math.round((a.score / a.sampleSize) * 100);
      }
      overallAverageScore = this.round(sumPercentage / totalAttempts);
    }

    // Get difficulty breakdown, trend, and top missed questions concurrently
    const [difficultyBreakdown, trend, topMissedQuestions] = await Promise.all([
      this.getDifficultyBreakdown(assessmentId),
      this.getAssessmentTrend(assessmentId),
      this.getTopMissedQuestions(assessmentId, 5),
    ]);

    return {
      assessmentId,
      assessmentTitle: assessment.title,
      totalAttempts,
      uniqueStudents,
      overallPassRate,
      overallAverageScore,
      difficultyBreakdown,
      trend,
      topMissedQuestions,
      generatedAt: new Date(),
    };
  }

  // ─────────────────── TASK A4: FACULTY INSIGHT SUMMARY ───────────────────

  /**
   * All assessments owned by a faculty member — summary stats for their dashboard.
   * Includes trend direction (UP/DOWN/STABLE) comparing last 7 vs previous 7 days.
   */
  async getFacultyAssessmentInsightSummary(
    facultyUserId: string,
  ): Promise<FacultyInsightSummary> {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId: facultyUserId },
      include: {
        programs: {
          include: {
            tracks: {
              include: {
                modules: {
                  include: {
                    assessments: {
                      select: { id: true, title: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!faculty) {
      throw new ForbiddenException('Faculty profile not found');
    }

    // Flatten all assessments with module context
    const assessmentItems: { id: string; title: string; moduleTitle: string }[] = [];
    for (const program of faculty.programs) {
      for (const track of program.tracks) {
        for (const mod of track.modules) {
          for (const assessment of mod.assessments) {
            assessmentItems.push({
              id: assessment.id,
              title: assessment.title,
              moduleTitle: mod.title,
            });
          }
        }
      }
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    let totalAttempts = 0;
    const allStudentIds = new Set<string>();
    let totalPassed = 0;

    const assessmentResults: FacultyAssessmentInsightItem[] = [];

    for (const item of assessmentItems) {
      const attempts = await this.fetchCompletedAttempts(item.id);
      const passed = attempts.filter((a) => a.passed).length;
      const attemptCount = attempts.length;

      totalAttempts += attemptCount;
      totalPassed += passed;
      for (const a of attempts) allStudentIds.add(a.userId);

      const passRate = attemptCount > 0 ? this.round(passed / attemptCount) : 0;
      let sumPercentage = 0;
      for (const a of attempts) {
        sumPercentage += a.score > a.sampleSize
          ? a.score
          : Math.round((a.score / a.sampleSize) * 100);
      }
      const averageScore = attemptCount > 0
        ? this.round(sumPercentage / attemptCount)
        : 0;

      // Compute trend direction
      const recentAttempts = attempts.filter(
        (a) => a.completedAt >= sevenDaysAgo,
      );
      const previousAttempts = attempts.filter(
        (a) => a.completedAt >= fourteenDaysAgo && a.completedAt < sevenDaysAgo,
      );

      const recentPassRate = recentAttempts.length > 0
        ? recentAttempts.filter((a) => a.passed).length / recentAttempts.length
        : 0;
      const previousPassRate = previousAttempts.length > 0
        ? previousAttempts.filter((a) => a.passed).length / previousAttempts.length
        : 0;

      let trendDirection: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
      const trendDelta = recentPassRate - previousPassRate;
      if (trendDelta > 0.01) trendDirection = 'UP';
      else if (trendDelta < -0.01) trendDirection = 'DOWN';

      assessmentResults.push({
        assessmentId: item.id,
        assessmentTitle: item.title,
        moduleTitle: item.moduleTitle,
        totalAttempts: attemptCount,
        passRate,
        averageScore,
        trendDirection,
      });
    }

    return {
      totalAssessments: assessmentItems.length,
      totalAttempts,
      totalStudents: allStudentIds.size,
      overallPassRate: totalAttempts > 0
        ? this.round(totalPassed / totalAttempts)
        : 0,
      assessments: assessmentResults,
    };
  }

  // ─────────────────── TASK A4: INSTITUTION SUMMARY ───────────────────

  /**
   * Institution-level aggregation — only accessible by UNIVERSITY_ADMIN or DEZAI_ADMIN.
   */
  async getInstitutionAssessmentSummary(
    institutionId: string,
    requestingUserId: string,
  ): Promise<InstitutionAssessmentSummary> {
    // Validate institution access
    const user = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId: requestingUserId },
      });
      if (!admin || admin.institutionId !== institutionId) {
        throw new ForbiddenException(
          'You do not have access to this institution',
        );
      }
    }

    // Fetch all assessments for this institution via Program → Track → Module → Assessment chain
    const programs = await this.prisma.program.findMany({
      where: { institutionId },
      include: {
        tracks: {
          include: {
            modules: {
              include: {
                assessments: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
      },
    });

    const assessmentIds: { id: string; title: string }[] = [];
    for (const program of programs) {
      for (const track of program.tracks) {
        for (const mod of track.modules) {
          for (const assessment of mod.assessments) {
            assessmentIds.push({ id: assessment.id, title: assessment.title });
          }
        }
      }
    }

    let totalAttempts = 0;
    const allStudentIds = new Set<string>();
    let totalPassed = 0;

    const assessmentPassRates: { id: string; title: string; passRate: number }[] = [];

    for (const item of assessmentIds) {
      const attempts = await this.fetchCompletedAttempts(item.id);
      const passed = attempts.filter((a) => a.passed).length;
      totalAttempts += attempts.length;
      totalPassed += passed;
      for (const a of attempts) allStudentIds.add(a.userId);

      if (attempts.length > 0) {
        assessmentPassRates.push({
          id: item.id,
          title: item.title,
          passRate: this.round(passed / attempts.length),
        });
      }
    }

    // Sort to find top and lowest performing
    assessmentPassRates.sort((a, b) => b.passRate - a.passRate);

    return {
      institutionId,
      totalAssessments: assessmentIds.length,
      totalAttempts,
      totalStudentsAttempted: allStudentIds.size,
      institutionPassRate: totalAttempts > 0
        ? this.round(totalPassed / totalAttempts)
        : 0,
      topPerformingAssessment: assessmentPassRates.length > 0
        ? assessmentPassRates[0]
        : null,
      lowestPerformingAssessment: assessmentPassRates.length > 0
        ? assessmentPassRates[assessmentPassRates.length - 1]
        : null,
    };
  }

  // ─────────────────── PRIVATE HELPERS ───────────────────

  /**
   * Fetches completed attempts for an assessment.
   */
  private async fetchCompletedAttempts(
    assessmentId: string,
  ): Promise<CompletedAttemptForTrend[]> {
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      include: {
        assessment: { select: { sampleSize: true } },
      },
    });

    return attempts.map((a) => ({
      score: a.score,
      passed: a.passed,
      completedAt: a.completedAt!,
      userId: a.userId,
      sampleSize: a.assessment.sampleSize,
    }));
  }

  /**
   * Gets the top N most-missed questions for an assessment.
   */
  private async getTopMissedQuestions(
    assessmentId: string,
    limit: number,
  ) {
    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          assessmentId,
          completedAt: { not: null },
        },
      },
      include: {
        question: {
          select: { id: true, text: true, category: true, difficulty: true },
        },
      },
    });

    const questionStats = new Map<
      string,
      {
        question: { id: string; text: string; category: string | null; difficulty: Difficulty };
        totalAnswered: number;
        totalWrong: number;
      }
    >();

    for (const ans of answers) {
      const qId = ans.question.id;
      if (!questionStats.has(qId)) {
        questionStats.set(qId, {
          question: ans.question,
          totalAnswered: 0,
          totalWrong: 0,
        });
      }

      const stats = questionStats.get(qId)!;
      stats.totalAnswered++;
      if (!ans.isCorrect) stats.totalWrong++;
    }

    return Array.from(questionStats.values())
      .map((s) => ({
        questionId: s.question.id,
        questionText: s.question.text,
        category: s.question.category,
        difficulty: s.question.difficulty,
        wrongRate: s.totalAnswered > 0
          ? this.round(s.totalWrong / s.totalAnswered)
          : 0,
      }))
      .sort((a, b) => b.wrongRate - a.wrongRate)
      .slice(0, limit);
  }

  /**
   * Validates that an assessment exists.
   */
  private async validateAssessmentExists(assessmentId: string): Promise<void> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { id: true },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`,
      );
    }
  }

  /**
   * Rounds a number to 4 decimal places.
   */
  private round(value: number): number {
    return Math.round(value * 10000) / 10000;
  }
}
