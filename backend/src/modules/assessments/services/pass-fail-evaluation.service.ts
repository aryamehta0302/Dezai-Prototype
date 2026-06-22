import { Injectable } from '@nestjs/common';

// ─────────────────── TYPE DEFINITIONS ───────────────────

/**
 * Status of an assessment attempt lifecycle.
 */
export type AttemptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';

/**
 * Represents a question the student answered incorrectly.
 * Uses `category` from QuestionBankQuestion as a proxy for difficulty
 * since the schema does not include a dedicated difficulty field.
 */
export interface MissedQuestion {
  questionId: string;
  questionText: string;
  selectedOptionText: string;
  correctOptionText: string;
  category: string | null;
}

/**
 * Full evaluation result returned by `evaluate()`.
 */
export interface EvaluationResult {
  score: number;
  percentage: number;
  passed: boolean;
  status: AttemptStatus;
  missedQuestions: MissedQuestion[];
}

/**
 * Shape of an attempt answer row with its related question and option data.
 * Matches Prisma include shape: AttemptAnswer + question (with options) + selectedOption.
 */
export interface AttemptAnswerWithRelations {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  answeredAt: Date;
  question: {
    id: string;
    text: string;
    category: string | null;
    options: { id: string; text: string; isCorrect: boolean }[];
  };
  selectedOption: {
    id: string;
    text: string;
  };
}

/**
 * Minimal assessment shape needed by the evaluation service.
 */
export interface AssessmentForEvaluation {
  passingScore: number;
  sampleSize: number;
}

/**
 * Minimal attempt shape needed by the evaluation service.
 */
export interface AttemptForEvaluation {
  id: string;
  score: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

// ─────────────────── SERVICE ───────────────────

/**
 * PassFailEvaluationService — Centralises all scoring, status derivation,
 * and missed-question analysis so it can be called from submitAttempt(),
 * result endpoints, and analytics without duplication.
 *
 * This is a pure computation service with zero database dependencies.
 */
@Injectable()
export class PassFailEvaluationService {
  /**
   * Full evaluation: computes score, percentage, pass/fail, status,
   * and identifies all missed questions.
   *
   * @param attempt   - The attempt being evaluated (may be in-progress or completed)
   * @param assessment - The assessment's passing criteria
   * @param answers   - The attempt's answers with full question+option relations
   * @returns EvaluationResult with score, percentage, passed, status, missedQuestions
   */
  evaluate(
    attempt: AttemptForEvaluation,
    assessment: AssessmentForEvaluation,
    answers: AttemptAnswerWithRelations[],
  ): EvaluationResult {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = assessment.sampleSize;
    const percentage = this.calculatePercentage(correctCount, totalQuestions);
    const passed = percentage >= assessment.passingScore;
    const status = this.getStatus(attempt, assessment, answers);
    const missedQuestions = this.getMissedQuestions(answers);

    return {
      score: correctCount,
      percentage,
      passed,
      status,
      missedQuestions,
    };
  }

  /**
   * Derives the lifecycle status of an attempt.
   *
   * - NOT_STARTED: no answers recorded and attempt not completed
   * - IN_PROGRESS: answers exist but attempt not completed
   * - PASSED / FAILED: attempt is completed
   */
  getStatus(
    attempt: AttemptForEvaluation,
    assessment: AssessmentForEvaluation,
    answers: AttemptAnswerWithRelations[],
  ): AttemptStatus {
    if (attempt.completedAt) {
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const percentage = this.calculatePercentage(correctCount, assessment.sampleSize);
      return percentage >= assessment.passingScore ? 'PASSED' : 'FAILED';
    }

    if (answers.length === 0) {
      return 'NOT_STARTED';
    }

    return 'IN_PROGRESS';
  }

  /**
   * Calculates percentage rounded to 2 decimal places.
   * Returns 0 if totalQuestions is zero to prevent division by zero.
   */
  calculatePercentage(score: number, totalQuestions: number): number {
    if (totalQuestions <= 0) return 0;
    return Math.round(((score / totalQuestions) * 100) * 100) / 100;
  }

  /**
   * Extracts all incorrectly answered questions, sorted by category
   * alphabetically descending (as a proxy for difficulty sorting since
   * the schema has no dedicated difficulty field).
   */
  getMissedQuestions(answers: AttemptAnswerWithRelations[]): MissedQuestion[] {
    return answers
      .filter((a) => !a.isCorrect)
      .map((a) => {
        const correctOption = a.question.options.find((o) => o.isCorrect);
        return {
          questionId: a.questionId,
          questionText: a.question.text,
          selectedOptionText: a.selectedOption.text,
          correctOptionText: correctOption?.text ?? 'N/A',
          category: a.question.category,
        };
      })
      .sort((a, b) => {
        // Sort by category descending (nulls last)
        const catA = a.category ?? '';
        const catB = b.category ?? '';
        return catB.localeCompare(catA);
      });
  }
}
