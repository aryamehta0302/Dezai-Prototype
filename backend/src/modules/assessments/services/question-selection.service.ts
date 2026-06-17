import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

/**
 * QuestionSelectionService — Implements the 100:15 Dynamic Question Selection Engine.
 *
 * This is a dedicated injectable service (not a method on AssessmentService)
 * as explicitly required by the Sprint 3 allocation.
 *
 * Algorithm:
 * 1. Fetch all questions + options from the assessment's linked QuestionBank
 * 2. Apply Fisher-Yates shuffle to the full question pool
 * 3. Slice the first `sampleSize` (default 15) questions
 * 4. Shuffle options[] within each selected question independently
 * 5. Return the session-specific question set — no two students see the same order
 */
@Injectable()
export class QuestionSelectionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Select a randomized set of questions for an assessment attempt.
   * Each call produces a unique permutation.
   */
  async selectQuestions(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questionBank: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`
      );
    }

    const allQuestions = assessment.questionBank.questions;

    if (allQuestions.length === 0) {
      return [];
    }

    // Step 1: Clone the questions array to avoid mutating the original
    const pool = allQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category,
      timerSeconds: q.timerSeconds,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        // Note: isCorrect is intentionally excluded from the response
        // to prevent leaking answers to the client
      })),
    }));

    // Step 2: Fisher-Yates shuffle the question pool
    this.fisherYatesShuffle(pool);

    // Step 3: Slice the first sampleSize questions
    const sampleSize = Math.min(assessment.sampleSize, pool.length);
    const selected = pool.slice(0, sampleSize);

    // Step 4: Shuffle options within each selected question independently
    for (const question of selected) {
      this.fisherYatesShuffle(question.options);
    }

    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      sampleSize,
      totalAvailable: allQuestions.length,
      questions: selected,
    };
  }

  /**
   * Fisher-Yates (Knuth) shuffle algorithm.
   * Shuffles the array in-place with O(n) time complexity.
   */
  private fisherYatesShuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
