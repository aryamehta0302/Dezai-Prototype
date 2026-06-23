// ─────────────────── SPRINT 6 RESPONSE DTOs — FACULTY INSIGHTS & INTERVENTION ───────────────────
//
// Response-shape interfaces for Task B endpoints (At-Risk, Failure Patterns, Academic Health).
// Follows the Sprint 5 pattern: pure interfaces, not class-validator DTOs.

// ─────────────────── TASK B1: AT-RISK / LOW PROGRESS / INACTIVE ───────────────────

export interface AtRiskStudent {
  userId: string;
  userName: string;
  assessmentId: string;
  assessmentTitle: string;
  failCount: number;
  lastAttemptDate: Date;
  lastScore: number;
}

export interface LowProgressStudent {
  userId: string;
  userName: string;
  programId: string;
  programTitle: string;
  progressPercent: number;
  enrolledAt: Date;
  daysSinceEnrollment: number;
}

export interface InactiveStudent {
  userId: string;
  userName: string;
  lastActiveAt: Date | null;
  daysInactive: number;
  enrolledPrograms: string[];   // program titles
}

export interface AcademicHealthComponents {
  assessmentPassRate: number;   // 0–100
  progressRate: number;         // 0–100 (avg Enrollment.progress across programs)
  activityScore: number;        // 0–100 (100 if active today, decreases by 10/day)
  streakScore: number;          // 0–100 (User.streakCount / 30 * 100, capped at 100)
}

export interface AcademicHealthResult {
  userId: string;
  healthScore: number;          // 0–100 composite
  components: AcademicHealthComponents;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  // LOW: healthScore >= 70 | MEDIUM: 40–69 | HIGH: < 40
}

export interface FacultyInsightDashboardSummary {
  totalAtRisk: number;
  totalLowProgress: number;
  totalInactive: number;
  totalStudentsMonitored: number;
}

export interface FacultyInsightDashboard {
  atRiskStudents: AtRiskStudent[];
  lowProgressStudents: LowProgressStudent[];
  inactiveStudents: InactiveStudent[];
  summary: FacultyInsightDashboardSummary;
}

// ─────────────────── TASK B2: REPEATED FAILURE DETECTION ───────────────────

export interface RepeatedFailureResult {
  userId: string;
  userName: string;
  assessmentId: string;
  assessmentTitle: string;
  totalAttempts: number;
  failedAttempts: number;
  failRate: number;              // failedAttempts / totalAttempts
  consecutiveFailures: number;   // current streak of failures (most recent N attempts all failed)
  averageScore: number;
  lastAttemptDate: Date;
}

export interface FailureConcentrationByDifficulty {
  EASY: number;     // % of wrong answers at this difficulty among failing students
  MEDIUM: number;
  HARD: number;
}

export interface AssessmentFailurePattern {
  assessmentId: string;
  assessmentTitle: string;
  studentsWithRepeatedFailures: number;
  averageAttemptsBeforePass: number | null;   // null if no one has passed
  commonWeakCategories: string[];
  failureConcentrationByDifficulty: FailureConcentrationByDifficulty;
}

// ─────────────────── TASK B3: STUDENT DETAIL INSIGHT ───────────────────

export interface StudentEnrolledProgram {
  programId: string;
  programTitle: string;
  progress: number;
  enrolledAt: Date;
}

export interface StudentAssessmentStats {
  totalAttempts: number;
  passedAttempts: number;
  passRate: number;
  averageScore: number;
  weakTopics: string[];          // category names from WeakTopicDetectionService
}

export interface StudentDetailInsight {
  userId: string;
  userName: string;
  email: string;
  enrolledPrograms: StudentEnrolledProgram[];
  assessmentStats: StudentAssessmentStats;
  academicHealth: AcademicHealthResult;
  xp: number;
  streakCount: number;
  lastActiveAt: Date | null;
}
