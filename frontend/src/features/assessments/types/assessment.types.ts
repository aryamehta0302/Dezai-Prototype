export interface AttemptQuestionOption {
  id: string;
  text: string;
}

export interface AttemptQuestion {
  id: string;
  text: string;
  category?: string;
  timerSeconds?: number;
  options: AttemptQuestionOption[];
}

export interface Attempt {
  success: boolean;
  attemptId: string;
  sessionId: string;
  startedAt: string;
  warningsCount: number;
  scoreDeduction: number;
  lockoutUntil: string | null;
  status: string;
  assessmentId: string;
  assessmentTitle: string;
  passingScore: number;
  timeLimit: number;
  sampleSize: number;
  totalAvailable: number;
  questions: AttemptQuestion[];
  remainingTime?: number;
  answers?: Record<string, string>;
  maxAttempts?: number;
  timeLimitEnabled?: boolean;
  allowResume?: boolean;
}

export interface AttemptResultQuestionItem {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  isCorrect: boolean;
  correctOptionId: string;
  correctOptionText: string;
  options: { id: string; text: string }[];
  explanation?: string;
}

export interface AttemptResult {
  success: boolean;
  attemptId: string;
  assessmentTitle: string;
  score: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  timeTaken?: number;
  startedAt: string;
  completedAt: string;
  questions: AttemptResultQuestionItem[];
  /** @deprecated Use `questions` instead */
  breakdown?: AttemptResultQuestionItem[];
}

export interface AttemptHistoryItem {
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
}

export interface AttemptStatusResponse {
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
