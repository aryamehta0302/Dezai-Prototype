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
}

export interface AttemptResultBreakdownItem {
  questionId: string;
  text: string;
  category?: string;
  options: AttemptQuestionOption[];
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
  explanation: string;
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
  startedAt: string;
  completedAt: string;
  breakdown: AttemptResultBreakdownItem[];
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
