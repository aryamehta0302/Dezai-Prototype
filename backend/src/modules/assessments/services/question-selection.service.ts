import { Injectable, NotFoundException, Inject, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../../../database/prisma.service";

/**
 * Implements the 100:15 Dynamic Question Selection Engine.
 *
 * Algorithm:
 * 1. Fetch all questions + options from the assessment's linked QuestionBank
 * 2. Apply Fisher-Yates shuffle to the full question pool
 * 3. Slice the first `sampleSize` (default 15) questions
 * 4. Shuffle options[] within each selected question independently
 * 5. Return the session-specific question set — no two students see the same order
 *
 * Sprint 7: Added cache-aside for question bank data (5-min TTL).
 */
@Injectable()
export class QuestionSelectionService {
  private readonly logger = new Logger(QuestionSelectionService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Select a randomized set of questions for an assessment attempt.
   * If a seed is provided, the selection and shuffle will be deterministic.
   */
  async selectQuestions(assessmentId: string, seed?: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        title: true,
        passingScore: true,
        timeLimit: true,
        sampleSize: true,
        questionBankId: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`
      );
    }

    // ── Cache-aside: try cache first for the raw question pool ──
    const cacheKey = `qbank:${assessmentId}:questions`;
    let allQuestions: {
      id: string;
      text: string;
      category: string | null;
      timerSeconds: number;
      options: { id: string; text: string }[];
    }[];

    const cached = await this.cacheManager.get<typeof allQuestions>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache HIT for ${cacheKey}`);
      allQuestions = cached;
    } else {
      this.logger.debug(`Cache MISS for ${cacheKey}`);

      const questionBank = await this.prisma.questionBank.findUnique({
        where: { id: assessment.questionBankId },
        include: {
          questions: {
            include: { options: true },
          },
        },
      });

      const rawQuestions = questionBank?.questions ?? [];

      // Map to clean shape (strip isCorrect from options)
      allQuestions = rawQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        timerSeconds: q.timerSeconds,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
      }));

      // Only cache non-empty question banks
      if (allQuestions.length > 0) {
        await this.cacheManager.set(cacheKey, allQuestions, 300_000); // 5 min TTL
      }
    }

    if (allQuestions.length === 0) {
    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      passingScore: assessment.passingScore,
      timeLimit: assessment.timeLimit,
      sampleSize: 0,
      totalAvailable: 0,
      questions: [],
    };
    }

    // Step 1: Clone the questions array to avoid mutating the cached data
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
      timeLimit: assessment.timeLimit,
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

