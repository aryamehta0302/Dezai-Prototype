/**
 * @module features/analytics/types
 *
 * TypeScript interfaces for the Dezai analytics feature.
 * All shapes mirror existing backend response DTOs — no new backend endpoints.
 *
 * Sources:
 *   - GET /api/analytics/faculty/extended        → ExtendedAnalytics
 *   - GET /api/analytics/programs/:id            → ProgramAnalytics
 *   - GET /api/analytics/programs/:id/modules/stats → ModuleCompletionStat[]
 *   - GET /api/leaderboards/students             → StudentLeaderboardResponse
 *   - GET /api/leaderboards/widgets/student      → StudentWidgetResponse
 *   - GET /api/leaderboards/universities         → UniversityLeaderboardResponse
 */

// ─── Faculty Extended Analytics ───────────────────────────────────────────────

export interface StudentMetric {
  userId: string;
  name: string;
  email: string;
  xp: number;
  progress: number;
  programTitle: string;
}

export interface DifficultModule {
  moduleId: string;
  moduleTitle: string;
  programTitle: string;
  passRate: number;
  averageScore: number;
  totalAttempts: number;
}

export interface ExtendedAnalytics {
  totalPrograms: number;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  topStudents: StudentMetric[];
  weakStudents: StudentMetric[];
  difficultModules: DifficultModule[];
}

// ─── Program Analytics ────────────────────────────────────────────────────────

export interface ProgramAnalytics {
  programId: string;
  programTitle: string;
  totalEnrollments: number;
  activeLearners: number;
  completionPercent: number;
  totalXp: number;
}

// ─── Module Completion Stats ──────────────────────────────────────────────────

export interface ModuleCompletionStat {
  moduleId: string;
  moduleTitle: string;
  completedCount: number;
  totalStudents: number;
  completionPercent: number;
}

// ─── Student Leaderboard ──────────────────────────────────────────────────────

export type LeaderboardRange = "weekly" | "monthly" | "all";

export interface StudentLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streakCount: number;
  institution: string;
}

export interface StudentLeaderboardResponse {
  range: LeaderboardRange;
  generatedAt: string;
  total: number;
  entries: StudentLeaderboardEntry[];
}

// ─── Student Widget ───────────────────────────────────────────────────────────

export interface LeaderboardWidgetEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  isCurrentUser: boolean;
}

export interface StudentWidgetResponse {
  currentUserRank: number | null;
  currentUserXp: number;
  topStudents: LeaderboardWidgetEntry[];
}

// ─── University Leaderboard ───────────────────────────────────────────────────

export interface UniversityLeaderboardEntry {
  rank: number;
  institutionId: string;
  institutionName: string;
  totalXp: number;
  activeStudents: number;
  fastestCompletionDays: number | null;
}

export interface UniversityLeaderboardResponse {
  generatedAt: string;
  total: number;
  entries: UniversityLeaderboardEntry[];
}

// ─── XP Growth (client-side derived) ─────────────────────────────────────────

/** One data point in the XP level milestone chart (derived client-side from xp total) */
export interface XpMilestone {
  level: number;
  xpRequired: number;
  xpLabel: string;
  isReached: boolean;
  isCurrent: boolean;
}
