// ─────────────────── SPRINT 5 RESPONSE DTOs ───────────────────
//
// These are response-shape interfaces — not class-validator DTOs.
// Used for type-safe controller return values and API documentation.

import { AttemptStatus } from '../services/pass-fail-evaluation.service';

// ─────────────────── TASK 1: RESULT & HISTORY ───────────────────

/**
 * GET /api/assessments/attempts/:attemptId/result
 */
export interface GetAttemptResultResponseDto {
  attemptId: string;
  assessmentTitle: string;
  score: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  timeTaken: number; // seconds between startedAt and completedAt
  startedAt: Date;
  completedAt: Date;
  questions: AttemptQuestionBreakdownDto[];
}

export interface AttemptQuestionBreakdownDto {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  isCorrect: boolean;
  correctOptionId: string;
  correctOptionText: string;
}

/**
 * GET /api/assessments/:assessmentId/attempts/history
 */
export interface AttemptHistoryResponseDto {
  assessmentId: string;
  assessmentTitle: string;
  totalAttempts: number;
  attempts: AttemptHistorySummaryDto[];
}

export interface AttemptHistorySummaryDto {
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

/**
 * GET /api/assessments/attempts/my-history
 */
export interface MyHistoryResponseDto {
  userId: string;
  attempts: MyHistoryAttemptDto[];
}

export interface MyHistoryAttemptDto {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  moduleTitle: string;
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

// ─────────────────── TASK 2: ATTEMPT STATUS ───────────────────

/**
 * GET /api/assessments/:assessmentId/attempt-status
 */
export interface AttemptStatusResponseDto {
  assessmentId: string;
  attemptsUsed: number;
  attemptsRemaining: number;
  maxAttempts: number;
  hasActiveAttempt: boolean;
  activeAttemptId: string | null;
  canAttempt: boolean;
  bestScore: number | null;
  bestPercentage: number | null;
  everPassed: boolean;
}

// ─────────────────── TASK 4: ANALYTICS ───────────────────

/**
 * GET /api/assessments/:assessmentId/result-analytics
 */
export interface ResultAnalyticsResponseDto {
  assessmentId: string;
  totalAttempts: number;
  uniqueStudents: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  passedAttempts: number;
  failedAttempts: number;
  scoreDistribution: ScoreDistributionBucketDto[];
}

export interface ScoreDistributionBucketDto {
  range: string;
  count: number;
}

/**
 * GET /api/assessments/:assessmentId/missed-questions-analytics
 */
export interface MissedQuestionsAnalyticsResponseDto {
  assessmentId: string;
  questions: MissedQuestionAnalyticsDto[];
}

export interface MissedQuestionAnalyticsDto {
  questionId: string;
  questionText: string;
  category: string | null;
  totalAnswered: number;
  totalWrong: number;
  wrongRate: number;
}
