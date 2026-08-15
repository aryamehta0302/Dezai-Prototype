// ─────────────────── ASSESSMENT INTELLIGENCE ───────────────────
//
// Response-shape interfaces for weak topics, accuracy, and analytics.

import { Difficulty } from '@prisma/client';

// ─────────────────── WEAK TOPICS ───────────────────

export interface WeakTopicResult {
  category: string;
  totalAnswered: number;
  totalWrong: number;
  wrongRate: number;           // 0–1 decimal
  isWeak: boolean;             // wrongRate >= WEAK_TOPIC_THRESHOLD
  difficulty: Difficulty;      // most common difficulty in this category
}

export interface AggregatedWeakTopicResult {
  category: string;
  affectedStudents: number;    // distinct userIds with wrongRate >= threshold
  totalStudents: number;
  affectedRate: number;        // affectedStudents / totalStudents
  averageWrongRate: number;
}

export interface IncorrectQuestionAnalysis {
  questionId: string;
  questionText: string;
  category: string | null;
  difficulty: Difficulty;
  timesAnsweredWrong: number;
  timesAnswered: number;
  wrongRate: number;
  mostSelectedWrongOptionText: string | null;  // the distractor most students pick
}

// ─────────────────── TOPIC ACCURACY TRACKING ───────────────────

export interface TopicAccuracyDataPoint {
  attemptId: string;
  attemptDate: Date;
  accuracyRate: number;        // correct / total for that category in that attempt
}

export interface TopicAccuracyTimeline {
  category: string;
  dataPoints: TopicAccuracyDataPoint[];
}

export interface TopicImprovementResult {
  category: string;
  firstAttemptAccuracy: number;
  latestAttemptAccuracy: number;
  delta: number;               // latestAttemptAccuracy - firstAttemptAccuracy
  improved: boolean;           // delta > 0
}

// ─────────────────── DIFFICULTY-BASED ANALYTICS ───────────────────

export interface DifficultyStats {
  totalQuestions: number;
  totalAnswered: number;
  correctAnswers: number;
  accuracyRate: number;        // correctAnswers / totalAnswered
}

export interface DifficultyBreakdown {
  EASY: DifficultyStats;
  MEDIUM: DifficultyStats;
  HARD: DifficultyStats;
}

export interface AssessmentTrendPoint {
  date: string;                // YYYY-MM-DD
  attemptsOnDate: number;
  averageScoreOnDate: number;
  passRateOnDate: number;
}

export interface TopMissedQuestion {
  questionId: string;
  questionText: string;
  category: string | null;
  difficulty: Difficulty;
  wrongRate: number;
}

export interface AssessmentPerformanceReport {
  assessmentId: string;
  assessmentTitle: string;
  totalAttempts: number;
  uniqueStudents: number;
  overallPassRate: number;
  overallAverageScore: number;
  difficultyBreakdown: DifficultyBreakdown;
  trend: AssessmentTrendPoint[];
  topMissedQuestions: TopMissedQuestion[];
  weakTopics: AggregatedWeakTopicResult[];
  generatedAt: Date;
}

// ─────────────────── INSIGHT SUMMARIES ───────────────────

export interface FacultyAssessmentInsightItem {
  assessmentId: string;
  assessmentTitle: string;
  moduleTitle: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
}

export interface FacultyInsightSummary {
  totalAssessments: number;
  totalAttempts: number;
  totalStudents: number;
  overallPassRate: number;
  assessments: FacultyAssessmentInsightItem[];
}

export interface InstitutionAssessmentSummary {
  institutionId: string;
  totalAssessments: number;
  totalAttempts: number;
  totalStudentsAttempted: number;
  institutionPassRate: number;
  topPerformingAssessment: { id: string; title: string; passRate: number } | null;
  lowestPerformingAssessment: { id: string; title: string; passRate: number } | null;
}
