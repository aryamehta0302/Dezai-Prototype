export interface QuizAttempt {
  quizId: string;
  courseId: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number | null>;
  tabSwitchCount: number;
}
