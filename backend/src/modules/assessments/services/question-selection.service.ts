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
   * If a seed is provided, the selection and shuffle will be deterministic.
   */
  async selectQuestions(assessmentId: string, seed?: string) {
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
      return {
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        passingScore: assessment.passingScore,
        sampleSize: 0,
        totalAvailable: 0,
        questions: [],
      };
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
      })),
    }));

    // Step 2: Set up the random function based on seed if provided
    let randomFn = Math.random;
    if (seed) {
      let seedNum = 0;
      for (let i = 0; i < seed.length; i++) {
        seedNum = Math.imul(31, seedNum) + seed.charCodeAt(i) | 0;
      }
      randomFn = this.mulberry32(seedNum);
    }

    // Step 3: Fisher-Yates shuffle the question pool
    this.fisherYatesShuffle(pool, randomFn);

    // Step 4: Slice the first sampleSize questions
    const sampleSize = Math.min(assessment.sampleSize, pool.length);
    const selected = pool.slice(0, sampleSize);

    // Step 5: Shuffle options within each selected question independently
    for (const question of selected) {
      this.fisherYatesShuffle(question.options, randomFn);
    }

    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      passingScore: assessment.passingScore,
      sampleSize,
      totalAvailable: allQuestions.length,
      questions: selected,
    };
  }

  /**
   * Mulberry32 pseudo-random number generator.
   */
  private mulberry32(a: number) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Fisher-Yates (Knuth) shuffle algorithm.
   */
  private fisherYatesShuffle<T>(array: T[], randomFn: () => number): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

