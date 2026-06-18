import { apiClient } from "@/core/api/client";

// ─── Shared Response Wrapper ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: any; // To allow for the named property like 'programs', 'enrollment', etc.
}

// ─── Program / Course Types ─────────────────────────────────────────────────

export interface ApiLesson {
  id: string;
  title: string;
  order: number;
  videoUrl?: string | null;
  content?: string | null;
}

export interface ApiModule {
  id: string;
  title: string;
  order: number;
  lessons: ApiLesson[];
}

export interface ApiTrack {
  id: string;
  title: string;
  type: "ROOTS" | "EDGE";
  modules: ApiModule[];
}

export interface ApiProgram {
  id: string;
  title: string;
  description: string;
  institution: { name: string; logoUrl?: string | null };
  faculty?: { user: { name: string; email: string } } | null;
  tracks: ApiTrack[];
  institutionId: string;
  facultyId: string | null;
  createdAt: string;
  updatedAt: string;
}

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
