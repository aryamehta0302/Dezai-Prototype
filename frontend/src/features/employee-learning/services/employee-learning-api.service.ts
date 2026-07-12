import { apiClient } from "@/core/api/client";
import type {
  DashboardStats,
  TrackProgress,
  TrackDetail,
  AssessmentWithStatus,
  AssessmentQuestion,
  AttemptResult,
  ActivityEvent,
  DailyActivity,
  EmployeeProfile,
  EmployeeNote,
  EmployeeBookmark,
  LeaderboardEntry,
  HistoryData,
} from "../types/employee-learning.types";

const BASE = "/employee-learning";

export const employeeLearningApi = {
  getDashboard: () => apiClient.get<DashboardStats & { success: boolean }>(`${BASE}/dashboard`),

  getProgress: () => apiClient.get<{ success: boolean; tracks: TrackProgress[] }>(`${BASE}/progress`),

  getTrackProgress: (track: string) =>
    apiClient.get<TrackDetail & { success: boolean }>(`${BASE}/progress/${track}`),

  listAssessments: () =>
    apiClient.get<{ success: boolean; assessments: AssessmentWithStatus[] }>(`${BASE}/assessments`),

  getAssessmentDetail: (id: string) =>
    apiClient.get<{ success: boolean; assessment: AssessmentWithStatus }>(`${BASE}/assessments/${id}`),

  startAttempt: (assessmentId: string) =>
    apiClient.post<{
      success: boolean;
      attemptId: string;
      assessmentTitle: string;
      complianceTrack: string;
      timeLimit: number;
      timeLimitEnabled: boolean;
      questions: AssessmentQuestion[];
      startedAt: string;
    }>(`${BASE}/assessments/${assessmentId}/start`),

  submitAttempt: (assessmentId: string, answers: Record<string, string>, timeTakenSeconds?: number) =>
    apiClient.post<AttemptResult & { success: boolean }>(
      `${BASE}/assessments/${assessmentId}/submit`,
      { answers, timeTakenSeconds },
    ),

  getAssessmentHistory: (assessmentId: string) =>
    apiClient.get<{ success: boolean; attempts: Array<{ id: string; score: number; percentage: number; passed: boolean; startedAt: string; completedAt: string | null }> }>(
      `${BASE}/assessments/${assessmentId}/history`,
    ),

  getNote: (assessmentId: string) =>
    apiClient.get<{ success: boolean; note: EmployeeNote | null }>(
      `${BASE}/assessments/${assessmentId}/notes`,
    ),

  upsertNote: (assessmentId: string, content: string) =>
    apiClient.put<{ success: boolean; note: EmployeeNote }>(
      `${BASE}/assessments/${assessmentId}/notes`,
      { content },
    ),

  toggleBookmark: (assessmentId: string) =>
    apiClient.post<{ success: boolean; assessmentId: string; bookmarked: boolean }>(
      `${BASE}/assessments/${assessmentId}/bookmark`,
    ),

  getBookmarks: () =>
    apiClient.get<{ success: boolean; bookmarks: EmployeeBookmark[] }>(`${BASE}/bookmarks`),

  getAllNotes: () =>
    apiClient.get<{ success: boolean; notes: EmployeeNote[] }>(`${BASE}/notes`),

  getHistory: () =>
    apiClient.get<HistoryData & { success: boolean }>(`${BASE}/history`),

  getTimeline: (limit?: number, offset?: number) => {
    const params: Record<string, string> = {};
    if (limit) params.limit = String(limit);
    if (offset) params.offset = String(offset);
    return apiClient.get<{
      success: boolean;
      events: ActivityEvent[];
      total: number;
      hasMore: boolean;
    }>(`${BASE}/timeline`, { params });
  },

  getDailyActivity: (year?: number) => {
    const params: Record<string, string> = {};
    if (year) params.year = String(year);
    return apiClient.get<{ success: boolean; activity: DailyActivity[] }>(
      `${BASE}/daily-activity`,
      { params },
    );
  },

  getStats: () =>
    apiClient.get<{
      success: boolean;
      xp: number;
      currentStreak: number;
      assessmentsPassed: number;
      credentialsEarned: number;
      orgRank: number | null;
    }>(`${BASE}/stats`),

  getLeaderboard: (limit?: number) => {
    const params: Record<string, string> = {};
    if (limit) params.limit = String(limit);
    return apiClient.get<{
      success: boolean;
      entries: LeaderboardEntry[];
      currentUser: { rank: number; xp: number } | null;
      organization: string;
    }>(`${BASE}/leaderboard`, { params });
  },

  getProfile: () =>
    apiClient.get<{ success: boolean; profile: EmployeeProfile }>(`${BASE}/profile`),
};
