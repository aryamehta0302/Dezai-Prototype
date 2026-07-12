export enum ComplianceTrack {
  CYBER_SECURITY = "CYBER_SECURITY",
  PASSWORD_SECURITY = "PASSWORD_SECURITY",
  DATA_PRIVACY = "DATA_PRIVACY",
  SECURE_EMAIL = "SECURE_EMAIL",
}

export const COMPLIANCE_TRACK_LABELS: Record<ComplianceTrack, string> = {
  [ComplianceTrack.CYBER_SECURITY]: "Cyber Security",
  [ComplianceTrack.PASSWORD_SECURITY]: "Password Security",
  [ComplianceTrack.DATA_PRIVACY]: "Data Privacy",
  [ComplianceTrack.SECURE_EMAIL]: "Secure Email",
};

export interface TrackProgress {
  track: ComplianceTrack;
  label: string;
  totalAssessments: number;
  attemptedAssessments: number;
  passedAssessments: number;
  credentialsEarned: number;
  completionPercentage: number;
  lastActivityAt: string | null;
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
  timestamp: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export type ActivityType =
  | "ASSESSMENT_STARTED"
  | "ASSESSMENT_COMPLETED"
  | "ASSESSMENT_PASSED"
  | "ASSESSMENT_FAILED"
  | "CREDENTIAL_EARNED"
  | "CREDENTIAL_REVOKED"
  | "XP_EARNED"
  | "ACHIEVEMENT_UNLOCKED"
  | "NOTE_CREATED"
  | "BOOKMARK_ADDED";

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
  lastAttemptAt: string | null;
  questionCount: number;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  category: string | null;
  difficulty: string;
  timerSeconds: number;
  options: { id: string; text: string }[];
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
  startedAt: string;
  completedAt: string;
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
  joinedAt: string | null;
  totalXp: number;
  level: number;
  assessmentsPassed: number;
  credentialsEarned: number;
  currentStreak: number;
  lastActiveAt: string | null;
}

export interface EmployeeNote {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeBookmark {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  complianceTrack: ComplianceTrack;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  xp: number;
  streakCount: number;
  isCurrentUser: boolean;
}

export interface DailyActivity {
  date: string;
  count: number;
}

export interface HistoryData {
  attempts: Array<{
    id: string;
    assessmentId: string;
    assessmentTitle: string;
    complianceTrack: ComplianceTrack;
    score: number;
    percentage: number;
    passed: boolean;
    startedAt: string;
    completedAt: string | null;
    timeTakenSeconds: number | null;
  }>;
  credentials: Array<{
    id: string;
    complianceTrack: ComplianceTrack;
    verificationCode: string;
    issuedAt: string;
    status: string;
    assessmentTitle: string | null;
  }>;
  summary: {
    totalAttempts: number;
    passedAttempts: number;
    totalCredentials: number;
    activeCredentials: number;
  };
}

export interface TrackDetail {
  track: ComplianceTrack;
  label: string;
  totalAssessments: number;
  passedAssessments: number;
  credentialsEarned: number;
  assessments: Array<{
    id: string;
    title: string;
    complianceTrack: ComplianceTrack;
    passingScore: number;
    maxAttempts: number;
    attemptsUsed: number;
    bestScore: number | null;
    bestPercentage: number | null;
    everPassed: boolean;
    lastAttemptAt: string | null;
  }>;
}
