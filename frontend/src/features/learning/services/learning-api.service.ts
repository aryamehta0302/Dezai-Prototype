import { apiClient } from "@/core/api/client";
import type { ApiProgram, ApiTrack, ApiModule, ApiLesson } from "@/features/programs/types/program.types";

export type { ApiProgram, ApiTrack, ApiModule, ApiLesson };

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
    apiClient.get<{ success: boolean; enrollments: any[] }>("/enrollments"),

  /**
   * Enroll in a program
   */
  enroll: (programId: string) =>
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
    apiClient.get<{ success: boolean; lesson: any }>(`/learning/lessons/${lessonId}`),

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
    apiClient.put<{ success: boolean; note: any }>(`/learning/lessons/${lessonId}/notes`, { content }),

  /**
   * Get lesson note
   */
  getNote: (lessonId: string) =>
    apiClient.get<{ success: boolean; note: any }>(`/learning/lessons/${lessonId}/notes`),
};
