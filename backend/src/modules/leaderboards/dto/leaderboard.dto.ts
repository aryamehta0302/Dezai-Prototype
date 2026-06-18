/**
 * leaderboard.dto.ts
 *
 * Response type interfaces for all Leaderboard endpoints.
 *
 * Ranking rules (CTO-finalized):
 *   - Weekly:   sum of XpTransaction.amount WHERE createdAt >= (now - 7 days)
 *   - Monthly:  sum of XpTransaction.amount WHERE createdAt >= (now - 30 days)
 *   - All-time: User.xp (running total on User record)
 *   - streakCount is display-only — NOT used as ranking criterion
 *
 * Tie-breaking: equal XP = equal rank. Next rank skips (dense vs standard — standard used here).
 * Example: two students at XP=500 both get rank 3, next student gets rank 5.
 *
 * Dezai Terminology:
 *   - Program     (not Course)
 *   - Institution (not College/University in code)
 *   - Enrollment  (not Registration)
 */

// ─── STUDENT LEADERBOARD ──────────────────────────────────────────────────────

/**
 * Time range filter for student leaderboard queries.
 */
export type LeaderboardRange = 'weekly' | 'monthly' | 'all';

/**
 * A single student entry in the student leaderboard.
 */
export interface StudentLeaderboardEntryDto {
  rank: number;
  userId: string;
  name: string;
  xp: number;           // XP for the selected time range
  streakCount: number;  // Display only — not a ranking criterion
  institution: string;  // From most recent enrollment's institution, or 'Independent'
}

/**
 * Full response for GET /api/leaderboards/students
 */
export interface StudentLeaderboardResponseDto {
  range: LeaderboardRange;
  generatedAt: Date;
  total: number;
  entries: StudentLeaderboardEntryDto[];
}

// ─── UNIVERSITY LEADERBOARD ───────────────────────────────────────────────────

/**
 * A single university (Institution) entry in the university leaderboard.
 */
export interface UniversityLeaderboardEntryDto {
  rank: number;
  institutionId: string;
  institutionName: string;
  totalXp: number;
  activeStudents: number;          // Active in last 30 days
  fastestCompletionDays: number | null;  // null if no enrollment completions yet
}

/**
 * Full response for GET /api/leaderboards/universities
 */
export interface UniversityLeaderboardResponseDto {
  generatedAt: Date;
  total: number;
  entries: UniversityLeaderboardEntryDto[];
}

// ─── PROGRAM LEADERBOARD ──────────────────────────────────────────────────────

/**
 * A single program entry in the program leaderboard.
 */
export interface ProgramLeaderboardEntryDto {
  rank: number;
  programId: string;
  programTitle: string;
  institutionName: string;
  totalXp: number;
  activeStudents: number;          // Active in last 30 days
  fastestCompletionDays: number | null;  // null if no completions yet
}

/**
 * Full response for GET /api/leaderboards/programs
 */
export interface ProgramLeaderboardResponseDto {
  generatedAt: Date;
  total: number;
  entries: ProgramLeaderboardEntryDto[];
}

// ─── LEADERBOARD WIDGETS ──────────────────────────────────────────────────────

/**
 * A single entry in a compact leaderboard widget (top-N list).
 */
export interface LeaderboardWidgetEntryDto {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  isCurrentUser: boolean;  // true if this entry is the requesting user
}

/**
 * Response for GET /api/leaderboards/widgets/student
 * Shows top-N students (all-time XP) + the current user's position.
 */
export interface StudentWidgetResponseDto {
  currentUserRank: number | null;  // null if user has 0 XP and is not ranked
  currentUserXp: number;
  topStudents: LeaderboardWidgetEntryDto[];
}

/**
 * Response for GET /api/leaderboards/widgets/faculty
 * Shows top-N students in the faculty's program (all-time XP).
 */
export interface FacultyWidgetResponseDto {
  programId: string | null;
  programTitle: string | null;
  topStudents: LeaderboardWidgetEntryDto[];
}
