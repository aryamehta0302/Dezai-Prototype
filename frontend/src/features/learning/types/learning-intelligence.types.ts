export interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface Milestone {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number;
  target: number;
  current: number;
}

export interface LearningPattern {
  mostActiveHour: number;
  mostActiveDay: string;
  averageSessionDurationMinutes: number;
  consistencyScore: number;
  weeklyActivity: { day: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  preferredContentType: string;
  patternSummary: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakHistory: { date: string; active: boolean }[];
}

export interface StudentInsight {
  id: string;
  type: 'PERFORMANCE' | 'PATTERN' | 'MILESTONE' | 'COMPARISON' | 'WARNING' | 'ENCOURAGEMENT';
  title: string;
  message: string;
  severity: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

export interface LearningRecommendation {
  type: 'REVIEW_MODULE' | 'PRACTICE_ASSESSMENT' | 'NEXT_LESSON' | 'WEAK_TOPIC' | 'SPEED_IMPROVEMENT';
  title: string;
  description: string;
  priority: number;
  moduleId?: string;
  assessmentId?: string;
  lessonId?: string;
}

export interface WeakTopic {
  topic: string;
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
}

export interface DifficultyAnalysis {
  difficulty: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface PredictionRule {
  rule: string;
  description: string;
  confidence: number;
}

export interface DailyActivityEntry {
  date: string;
  count: number;
}
