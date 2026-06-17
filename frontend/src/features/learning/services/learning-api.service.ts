import { apiClient } from "@/core/api/client";
import type {
  ApiEnrollmentsResponse,
  ApiEnrollResponse,
  ApiLessonResponse,
  ApiProgressResponse,
  ApiNoteResponse,
  ApiBookmarkResponse,
} from "@/features/programs/types/program.types";

export const learningApi = {
  getEnrollments: () =>
    apiClient.get<ApiEnrollmentsResponse>("/enrollments"),

  enroll: (programId: string) =>
    apiClient.post<ApiEnrollResponse>(`/enrollments/${programId}`),

  getLesson: (lessonId: string) =>
    apiClient.get<ApiLessonResponse>(`/learning/lessons/${lessonId}`),

  completeLesson: (lessonId: string) =>
    apiClient.post<ApiProgressResponse>(`/learning/lessons/${lessonId}/progress`),

  uncompleteLesson: (lessonId: string) =>
    apiClient.delete<{ success: boolean }>(`/learning/lessons/${lessonId}/progress`),

  toggleBookmark: (lessonId: string) =>
    apiClient.post<ApiBookmarkResponse>(`/learning/lessons/${lessonId}/bookmark`),

  upsertNote: (lessonId: string, content: string) =>
    apiClient.put<ApiNoteResponse>(`/learning/lessons/${lessonId}/notes`, { content }),

  getNote: (lessonId: string) =>
    apiClient.get<ApiNoteResponse>(`/learning/lessons/${lessonId}/notes`),

  getMyXp: () =>
    apiClient.get<{ success: boolean; xp: number; streakCount: number }>("/users/me/xp"),
};
