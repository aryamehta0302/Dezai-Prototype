import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Difficulty } from '@prisma/client';
import type {
  WeakTopicResult,
  AggregatedWeakTopicResult,
  IncorrectQuestionAnalysis,
  TopicAccuracyTimeline,
  TopicImprovementResult,
} from '../dto/intelligence.dto';

// ─────────────────── CONSTANTS ───────────────────

/** A category is "weak" when the student's wrong-answer rate meets or exceeds this threshold. */
const WEAK_TOPIC_THRESHOLD = 0.40;

// ─────────────────── INTERNAL TYPES ───────────────────

interface AnswerWithQuestion {
  isCorrect: boolean;
  attemptId: string;
  question: {
    id: string;
    text: string;
    category: string | null;
    difficulty: Difficulty;
    options: { id: string; text: string; isCorrect: boolean }[];
  };
  selectedOption: {
    id: string;
    text: string;
    isCorrect: boolean;
  };
  attempt: {
    id: string;
    startedAt: Date;
    completedAt: Date | null;
    userId: string;
  };
}

interface CategoryBucket {
  total: number;
  wrong: number;
  difficulties: Difficulty[];
}

// ─────────────────── SERVICE ───────────────────

/**
 * Analyses AttemptAnswer data to identify categories where students
 * perform below threshold, tracks accuracy over time, and provides
 * incorrect-question analysis with distractor identification.
 */
@Injectable()
export class WeakTopicDetectionService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────── TASK A1: WEAK TOPIC DETECTION ───────────────────

  /**
   * Per-student weak topics across all their completed attempts for a given assessment.
   */
  async getStudentWeakTopics(
    userId: string,
    assessmentId: string,
  ): Promise<WeakTopicResult[]> {
    await this.validateAssessmentExists(assessmentId);

    const answers = await this.fetchStudentAnswers(userId, assessmentId);
    return this.computeWeakTopics(answers);
  }

  /**
   * Per-student weak topics across ALL assessments they have ever attempted.
   */
  async getStudentGlobalWeakTopics(userId: string): Promise<WeakTopicResult[]> {
    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          userId,
          completedAt: { not: null },
        },
      },
      include: {
        question: { include: { options: true } },
        selectedOption: true,
        attempt: {
          select: { id: true, startedAt: true, completedAt: true, userId: true },
        },
      },
    });

    return this.computeWeakTopics(answers as unknown as AnswerWithQuestion[]);
  }

  /**
   * For faculty: aggregated weak topics across all students for an assessment.
   * Shows which categories the entire cohort struggles with.
   *
   * Sprint 7: Added facultyUserId verification.
   */
  async getAssessmentWeakTopics(
    assessmentId: string,
    facultyUserId: string,
  ): Promise<AggregatedWeakTopicResult[]> {
    await this.validateAssessmentExists(assessmentId);
    await this.validateAssessmentFacultyOwnership(assessmentId, facultyUserId);

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          assessmentId,
          completedAt: { not: null },
        },
      },
      include: {
        question: { include: { options: true } },
        selectedOption: true,
        attempt: {
          select: { id: true, startedAt: true, completedAt: true, userId: true },
        },
      },
    });

    // Group answers by userId → category
    const studentCategoryMap = new Map<string, Map<string, CategoryBucket>>();

    for (const ans of answers) {
      const userId = (ans as unknown as AnswerWithQuestion).attempt.userId;
      const category = ans.question.category ?? 'Uncategorised';

      if (!studentCategoryMap.has(userId)) {
        studentCategoryMap.set(userId, new Map());
      }

      const catMap = studentCategoryMap.get(userId)!;
      if (!catMap.has(category)) {
        catMap.set(category, { total: 0, wrong: 0, difficulties: [] });
      }

      const bucket = catMap.get(category)!;
      bucket.total++;
      if (!ans.isCorrect) bucket.wrong++;
      bucket.difficulties.push(ans.question.difficulty);
    }

    // Compute aggregated results per category
    const allCategories = new Set<string>();
    for (const catMap of studentCategoryMap.values()) {
      for (const cat of catMap.keys()) {
        allCategories.add(cat);
      }
    }

    const totalStudents = studentCategoryMap.size;
    const results: AggregatedWeakTopicResult[] = [];

    for (const category of allCategories) {
      let affectedStudents = 0;
      let wrongRateSum = 0;
      let studentsWithCategory = 0;

      for (const catMap of studentCategoryMap.values()) {
        const bucket = catMap.get(category);
        if (!bucket || bucket.total === 0) continue;

        studentsWithCategory++;
        const wrongRate = bucket.wrong / bucket.total;
        wrongRateSum += wrongRate;

        if (wrongRate >= WEAK_TOPIC_THRESHOLD) {
          affectedStudents++;
        }
      }

      if (studentsWithCategory === 0) continue;

      results.push({
        category,
        affectedStudents,
        totalStudents,
        affectedRate: this.round(affectedStudents / totalStudents),
        averageWrongRate: this.round(wrongRateSum / studentsWithCategory),
      });
    }

    return results.sort((a, b) => b.affectedRate - a.affectedRate);
  }

  /**
   * Incorrect answer analysis: which specific questions does a student get wrong most.
   * Includes the most commonly selected wrong option (distractor analysis).
   */
  async getIncorrectQuestionAnalysis(
    userId: string,
    assessmentId: string,
  ): Promise<IncorrectQuestionAnalysis[]> {
    await this.validateAssessmentExists(assessmentId);

    const answers = await this.fetchStudentAnswers(userId, assessmentId);

    // Group by questionId
    const questionMap = new Map<
      string,
      {
        question: AnswerWithQuestion['question'];
        timesAnswered: number;
        timesWrong: number;
        wrongOptionCounts: Map<string, { count: number; text: string }>;
      }
    >();

    for (const ans of answers) {
      const qId = ans.question.id;

      if (!questionMap.has(qId)) {
        questionMap.set(qId, {
          question: ans.question,
          timesAnswered: 0,
          timesWrong: 0,
          wrongOptionCounts: new Map(),
        });
      }

      const entry = questionMap.get(qId)!;
      entry.timesAnswered++;

      if (!ans.isCorrect) {
        entry.timesWrong++;
        const optId = ans.selectedOption.id;
        const existing = entry.wrongOptionCounts.get(optId);
        if (existing) {
          existing.count++;
        } else {
          entry.wrongOptionCounts.set(optId, {
            count: 1,
            text: ans.selectedOption.text,
          });
        }
      }
    }

    const results: IncorrectQuestionAnalysis[] = [];

    for (const [questionId, entry] of questionMap) {
      if (entry.timesWrong === 0) continue;

      // Find most selected wrong option
      let mostSelectedWrongOptionText: string | null = null;
      let maxWrongCount = 0;

      for (const optData of entry.wrongOptionCounts.values()) {
        if (optData.count > maxWrongCount) {
          maxWrongCount = optData.count;
          mostSelectedWrongOptionText = optData.text;
        }
      }

      results.push({
        questionId,
        questionText: entry.question.text,
        category: entry.question.category,
        difficulty: entry.question.difficulty,
        timesAnsweredWrong: entry.timesWrong,
        timesAnswered: entry.timesAnswered,
        wrongRate: this.round(entry.timesWrong / entry.timesAnswered),
        mostSelectedWrongOptionText,
      });
    }

    return results.sort((a, b) => b.wrongRate - a.wrongRate);
  }

  // ─────────────────── TASK A2: TOPIC ACCURACY TRACKING ───────────────────

  /**
   * Returns accuracy per category over time — one data point per attempt.
   * Supports trend chart rendering on the frontend.
   */
  async getStudentTopicAccuracyTimeline(
    userId: string,
    assessmentId: string,
  ): Promise<TopicAccuracyTimeline[]> {
    await this.validateAssessmentExists(assessmentId);

    const answers = await this.fetchStudentAnswers(userId, assessmentId);

    // Group by category → attemptId
    const categoryAttemptMap = new Map<
      string,
      Map<string, { correct: number; total: number; date: Date }>
    >();

    for (const ans of answers) {
      const category = ans.question.category ?? 'Uncategorised';
      const attemptId = ans.attemptId;

      if (!categoryAttemptMap.has(category)) {
        categoryAttemptMap.set(category, new Map());
      }

      const attemptMap = categoryAttemptMap.get(category)!;
      if (!attemptMap.has(attemptId)) {
        attemptMap.set(attemptId, {
          correct: 0,
          total: 0,
          date: ans.attempt.startedAt,
        });
      }

      const bucket = attemptMap.get(attemptId)!;
      bucket.total++;
      if (ans.isCorrect) bucket.correct++;
    }

    const results: TopicAccuracyTimeline[] = [];

    for (const [category, attemptMap] of categoryAttemptMap) {
      const dataPoints = Array.from(attemptMap.entries())
        .map(([attemptId, data]) => ({
          attemptId,
          attemptDate: data.date,
          accuracyRate: this.round(
            data.total > 0 ? data.correct / data.total : 0,
          ),
        }))
        .sort(
          (a, b) => a.attemptDate.getTime() - b.attemptDate.getTime(),
        );

      results.push({ category, dataPoints });
    }

    return results;
  }

  /**
   * Returns accuracy comparison: first attempt vs latest attempt per category.
   * Shows improvement delta and whether the student improved.
   */
  async getStudentTopicImprovement(
    userId: string,
    assessmentId: string,
  ): Promise<TopicImprovementResult[]> {
    const timeline = await this.getStudentTopicAccuracyTimeline(
      userId,
      assessmentId,
    );

    return timeline
      .filter((t) => t.dataPoints.length >= 2)
      .map((t) => {
        const first = t.dataPoints[0];
        const latest = t.dataPoints[t.dataPoints.length - 1];
        const delta = this.round(latest.accuracyRate - first.accuracyRate);

        return {
          category: t.category,
          firstAttemptAccuracy: first.accuracyRate,
          latestAttemptAccuracy: latest.accuracyRate,
          delta,
          improved: delta > 0,
        };
      });
  }

  // ─────────────────── PRIVATE HELPERS ───────────────────

  /**
   * Fetches all attempt answers for a student on a specific assessment
   * with full question/option relations.
   */
  private async fetchStudentAnswers(
    userId: string,
    assessmentId: string,
  ): Promise<AnswerWithQuestion[]> {
    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          userId,
          assessmentId,
          completedAt: { not: null },
        },
      },
      include: {
        question: { include: { options: true } },
        selectedOption: true,
        attempt: {
          select: { id: true, startedAt: true, completedAt: true, userId: true },
        },
      },
    });

    return answers as unknown as AnswerWithQuestion[];
  }

  /**
   * Computes weak topics from a flat list of answers.
   * Groups by category, calculates wrong rate, determines weakness.
   */
  private computeWeakTopics(answers: AnswerWithQuestion[]): WeakTopicResult[] {
    const byCategory = new Map<string, CategoryBucket>();

    for (const ans of answers) {
      const category = ans.question.category ?? 'Uncategorised';

      if (!byCategory.has(category)) {
        byCategory.set(category, { total: 0, wrong: 0, difficulties: [] });
      }

      const bucket = byCategory.get(category)!;
      bucket.total++;
      if (!ans.isCorrect) bucket.wrong++;
      bucket.difficulties.push(ans.question.difficulty);
    }

    const results: WeakTopicResult[] = [];

    for (const [category, bucket] of byCategory) {
      if (bucket.total === 0) continue;

      const wrongRate = this.round(bucket.wrong / bucket.total);

      results.push({
        category,
        totalAnswered: bucket.total,
        totalWrong: bucket.wrong,
        wrongRate,
        isWeak: wrongRate >= WEAK_TOPIC_THRESHOLD,
        difficulty: this.getMostCommonDifficulty(bucket.difficulties),
      });
    }

    return results.sort((a, b) => b.wrongRate - a.wrongRate);
  }

  /**
   * Returns the most frequently occurring difficulty level from an array.
   */
  private getMostCommonDifficulty(difficulties: Difficulty[]): Difficulty {
    const counts: Record<string, number> = {};
    for (const d of difficulties) {
      counts[d] = (counts[d] ?? 0) + 1;
    }

    let maxDifficulty: Difficulty = Difficulty.MEDIUM;
    let maxCount = 0;

    for (const [difficulty, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDifficulty = difficulty as Difficulty;
      }
    }

    return maxDifficulty;
  }

  /**
   * Validates that an assessment exists, throwing NotFoundException if not.
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
   * Validates that the requesting faculty member has ownership/access to the assessment.
   */
  private async validateAssessmentFacultyOwnership(
    assessmentId: string,
    userId: string,
  ): Promise<true> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        module: {
          include: {
            track: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const program = assessment.module.track.program;

    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!faculty) {
      throw new ForbiddenException('Faculty profile not found');
    }

    if (program.facultyId !== faculty.id && program.institutionId !== faculty.institutionId) {
      throw new ForbiddenException(
        'You do not have access to this assessment',
      );
    }

    return true;
  }

  /**
   * Rounds a number to 4 decimal places for clean output.
   */
  private round(value: number): number {
    return Math.round(value * 10000) / 10000;
  }
}

