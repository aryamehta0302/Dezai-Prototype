import { apiClient } from "@/core/api/client";
import type { ApiProgram, ApiTrack, ApiModule, ApiLesson, ApiResource } from "@/features/programs/types/program.types";
import type {
  ActivityEvent,
  Milestone,
  LearningPattern,
  StreakInfo,
  StudentInsight,
  LearningRecommendation,
  WeakTopic,
  DifficultyAnalysis,
  PredictionRule,
  DailyActivityEntry,
} from "../types/learning-intelligence.types";

export type { ApiProgram, ApiTrack, ApiModule, ApiLesson, ApiResource };

// ─── API Services ────────────────────────────────────────────────────────────

export const programsApi = {
  getAll: (institutionId?: string) =>
    apiClient.get<{ success: boolean; programs: ApiProgram[] }>("/programs", {
      params: institutionId ? { institutionId } : undefined,
    }),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; program: ApiProgram }>(`/programs/${id}`),
};

export const learningApi = {
  /**
   * Get all active enrollments for the student
   */
  getEnrollments: () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiClient.get<{ success: boolean; enrollments: any[] }>("/enrollments"),

  /**
   * Enroll in a program
   */
  enroll: (programId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiClient.post<{ success: boolean; enrollment: any }>(`/enrollments/${programId}`),

  /**
   * Get student's current XP and stats
   */
  getMyStats: () =>
    apiClient.get<{
      success: boolean;
      xp: number;
      streakCount: number;
      enrolledCourses: number;
      completedCourses: number;
      globalRank: number;
    }>("/learning/stats"),

  /**
   * Get lesson details
   */
  getLesson: (lessonId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiClient.get<{ success: boolean; lesson: any }>(`/learning/lessons/${lessonId}`),

  /**
   * Get resources for a lesson
   */
  getResources: (lessonId: string) =>
    apiClient.get<{ success: boolean; resources: ApiResource[] }>(`/learning/lessons/${lessonId}/resources`),

  /**
   * Mark lesson as complete
   */
  completeLesson: (lessonId: string) =>
    apiClient.post<{
      success: boolean;
      xpResult?: { amountAwarded: number; currentXp: number };
      alreadyCompleted?: boolean;
    }>(`/learning/lessons/${lessonId}/progress`),

  /**
   * Revert lesson completion
   */
  uncompleteLesson: (lessonId: string) =>
    apiClient.delete<{ success: boolean }>(`/learning/lessons/${lessonId}/progress`),

  /**
   * Toggle lesson bookmark
   */
  toggleBookmark: (lessonId: string) =>
    apiClient.post<{ success: boolean; bookmarked: boolean }>(`/learning/lessons/${lessonId}/bookmark`),

  /**
   * Upsert lesson note
   */
  upsertNote: (lessonId: string, content: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiClient.put<{ success: boolean; note: any }>(`/learning/lessons/${lessonId}/notes`, { content }),

  /**
   * Get lesson note
   */
  getNote: (lessonId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiClient.get<{ success: boolean; note: any }>(`/learning/lessons/${lessonId}/notes`),

  // ─── LEARNING INTELLIGENCE ──────────────────────────────────

  /**
   * Get daily activity counts (for heatmap)
   */
  getDailyActivity: (year?: number) =>
    apiClient.get<{ success: boolean; data: DailyActivityEntry[] }>("/learning/daily-activity", {
      params: year ? { year } : undefined,
    }),

  /**
   * Get activity timeline (cursor-based pagination)
   */
  getActivityTimeline: (params?: { limit?: number; cursor?: string; types?: string }) =>
    apiClient.get<{ success: boolean; data: ActivityEvent[]; nextCursor: string | null }>("/learning/activities", { params }),

  /**
   * Get milestones
   */
  getMilestones: () =>
    apiClient.get<{ success: boolean; data: Milestone[] }>("/learning/milestones"),

  /**
   * Get learning patterns
   */
  getLearningPatterns: () =>
    apiClient.get<{ success: boolean; data: LearningPattern }>("/learning/patterns"),

  /**
   * Get streak info
   */
  getStreakInfo: () =>
    apiClient.get<{ success: boolean; data: StreakInfo }>("/learning/streaks"),

  /**
   * Get student insights
   */
  getInsights: () =>
    apiClient.get<{ success: boolean; data: StudentInsight[] }>("/learning/insights"),

  /**
   * Get recommendations
   */
  getRecommendations: () =>
    apiClient.get<{ success: boolean; data: LearningRecommendation[] }>("/learning/recommendations"),

  /**
   * Get weak topics
   */
  getWeakTopics: () =>
    apiClient.get<{ success: boolean; data: WeakTopic[] }>("/learning/weak-topics"),

  /**
   * Get difficulty analysis
   */
  getDifficultyAnalysis: () =>
    apiClient.get<{ success: boolean; data: DifficultyAnalysis[] }>("/learning/difficulty-analysis"),

  /**
   * Get prediction rules
   */
  getPredictionRules: () =>
    apiClient.get<{ success: boolean; data: PredictionRule[] }>("/learning/prediction-rules"),
};
