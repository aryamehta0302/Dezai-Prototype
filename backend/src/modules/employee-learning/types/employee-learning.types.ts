import { ComplianceTrack } from '@prisma/client';

export interface TrackProgress {
  track: ComplianceTrack;
  label: string;
  totalAssessments: number;
  attemptedAssessments: number;
  passedAssessments: number;
  credentialsEarned: number;
  completionPercentage: number;
  lastActivityAt: Date | null;
}

export interface DashboardStats {
  totalAssessmentsAvailable: number;
  assessmentsAttempted: number;
  assessmentsPassed: number;
  credentialsEarned: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  orgRank: number | null;
  trackProgress: TrackProgress[];
}

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  timestamp: Date;
  description: string;
  metadata?: Record<string, unknown>;
}

export type ActivityType =
  | 'ASSESSMENT_STARTED'
  | 'ASSESSMENT_COMPLETED'
  | 'ASSESSMENT_PASSED'
  | 'ASSESSMENT_FAILED'
  | 'CREDENTIAL_EARNED'
  | 'CREDENTIAL_REVOKED'
  | 'XP_EARNED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'NOTE_CREATED'
  | 'BOOKMARK_ADDED';

export interface AssessmentWithStatus {
  id: string;
  title: string;
  complianceTrack: ComplianceTrack;
  passingScore: number;
  sampleSize: number;
  timeLimit: number;
  timeLimitEnabled: boolean;
  maxAttempts: number;
  attemptsUsed: number;
  bestScore: number | null;
  bestPercentage: number | null;
  everPassed: boolean;
  hasActiveAttempt: boolean;
  lastAttemptAt: Date | null;
  questionCount: number;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  category: string | null;
  difficulty: string;
  timerSeconds: number;
  options: AssessmentQuestionOption[];
}

export interface AssessmentQuestionOption {
  id: string;
  text: string;
}

export interface AttemptResult {
  attemptId: string;
  assessmentId: string;
  score: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  timeTakenSeconds: number | null;
  startedAt: Date;
  completedAt: Date;
  questions: AttemptQuestionBreakdown[];
}

export interface AttemptQuestionBreakdown {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  isCorrect: boolean;
  correctOptionId: string;
  correctOptionText: string;
  options: { id: string; text: string }[];
  explanation: string | null;
}

export interface EmployeeProfile {
  userId: string;
  name: string | null;
  email: string;
  avatar: string | null;
  employeeId: string;
  title: string | null;
  department: string | null;
  organization: string;
  organizationId: string;
  employmentStatus: string;
  joinedAt: Date | null;
  totalXp: number;
  level: number;
  assessmentsPassed: number;
  credentialsEarned: number;
  currentStreak: number;
  lastActiveAt: Date | null;
}

export interface EmployeeNote {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeBookmark {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  complianceTrack: ComplianceTrack;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  assessmentsPassed: number;
  credentialsEarned: number;
  isCurrentUser: boolean;
}

export interface DailyActivity {
  date: string;
  count: number;
}
