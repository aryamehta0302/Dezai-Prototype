/**
 * @module features/analytics/services
 *
 * Thin API client wrapper for all analytics and leaderboard endpoints.
 * Uses the shared apiClient — no direct fetch calls in components.
 *
 * Endpoints called (all pre-existing in backend):
 *   GET /api/analytics/programs/:id/modules/stats
 *   GET /api/analytics/programs/:id
 *   GET /api/analytics/faculty/extended
 *   GET /api/leaderboards/students?range=&limit=
 *   GET /api/leaderboards/widgets/student
 *   GET /api/leaderboards/universities?limit=
 */

import { apiClient } from "@/core/api/client";
import type {
  ModuleCompletionStat,
  ProgramAnalytics,
  ExtendedAnalytics,
  StudentLeaderboardResponse,
  StudentWidgetResponse,
  UniversityLeaderboardResponse,
  LeaderboardRange,
} from "../types/analytics.types";

// ─── Wrapped API response shape (backend wraps all responses in { success, data }) ──

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const analyticsService = {
  /**
   * Fetch per-module completion rates for a given program.
   * Used by: ModuleCompletionChart (faculty analytics tab, monitoring tab)
   */
  async getModuleStats(programId: string): Promise<ModuleCompletionStat[]> {
    const res = await apiClient.get<ApiWrapper<ModuleCompletionStat[]>>(
      `/analytics/programs/${programId}/modules/stats`
    );
    return res.success ? res.data : [];
  },

  /**
   * Fetch aggregate metrics for a single program.
   * Used by: InstitutionDashboardPage, monitoring tab
   */
  async getProgramAnalytics(programId: string): Promise<ProgramAnalytics | null> {
    try {
      const res = await apiClient.get<ApiWrapper<ProgramAnalytics>>(
        `/analytics/programs/${programId}`
      );
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch extended cohort analytics for the logged-in faculty.
   * Used by: ProgramPerformanceChart (faculty analytics tab)
   */
  async getExtendedAnalytics(): Promise<ExtendedAnalytics | null> {
    try {
      const res = await apiClient.get<ApiWrapper<ExtendedAnalytics>>(
        "/analytics/faculty/extended"
      );
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch student leaderboard for a given range.
   * Used by: rank delta calculation (weekly vs all-time comparison)
   */
  async getStudentLeaderboard(
    range: LeaderboardRange = "all",
    limit: number = 50
  ): Promise<StudentLeaderboardResponse | null> {
    try {
      const res = await apiClient.get<ApiWrapper<StudentLeaderboardResponse>>(
        "/leaderboards/students",
        { params: { range, limit } }
      );
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch the compact student widget (rank + top-N).
   * Used by: StudentDashboardPage (rank delta prop)
   */
  async getStudentWidget(): Promise<StudentWidgetResponse | null> {
    try {
      const res = await apiClient.get<ApiWrapper<StudentWidgetResponse>>(
        "/leaderboards/widgets/student"
      );
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch institution leaderboard (all institutions ranked by XP).
   * Used by: InstitutionDashboardPage
   */
  async getUniversityLeaderboard(
    limit: number = 20
  ): Promise<UniversityLeaderboardResponse | null> {
    try {
      const res = await apiClient.get<ApiWrapper<UniversityLeaderboardResponse>>(
        "/leaderboards/universities",
        { params: { limit } }
      );
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },
};
