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
  sampleSize: number;
  totalAvailable: number;
  questions: AttemptQuestion[];
  remainingTime?: number; // returned on resume
  answers?: Record<string, string>; // returned on resume (questionId -> selectedOptionId)
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
  passed: boolean;
  startedAt: string;
  completedAt: string;
  breakdown: AttemptResultBreakdownItem[];
}

export interface AttemptHistoryItem {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
}
