import { apiClient } from "@/core/api/client";
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationSummaryResponse,
  NotificationPreferencesResponse,
  NotificationPreferences,
  FollowsResponse,
  FollowStatusResponse,
  NotificationType,
  NotificationFilter,
} from "../types/notification.types";

export const notificationsApi = {
  getList: (filter: NotificationFilter = "all", type?: NotificationType) =>
    apiClient.get<NotificationListResponse>("/notifications", {
      params: { filter, ...(type ? { type } : {}) },
    }),

  getSummary: () =>
    apiClient.get<NotificationSummaryResponse>("/notifications/summary"),

  markAsRead: (id: string) =>
    apiClient.patch<{ success: boolean; notification: NotificationItem }>(
      `/notifications/${id}/read`,
      {}
    ),

  markAsUnread: (id: string) =>
    apiClient.patch<{ success: boolean }>(`/notifications/${id}/unread`, {}),

  archive: (id: string) =>
    apiClient.patch<{ success: boolean }>(`/notifications/${id}/archive`, {}),

  markAllAsRead: () =>
    apiClient.patch<{ success: boolean; data: { updatedCount: number } }>(
      "/notifications/mark-all-read",
      {}
    ),

  // ─── Preferences ───

  getPreferences: () =>
    apiClient.get<NotificationPreferencesResponse>("/notifications/preferences"),

  updatePreference: (type: NotificationType, enabled: boolean) =>
    apiClient.patch<{ success: boolean; data: NotificationPreferences }>(
      `/notifications/preferences/${type}`,
      { enabled }
    ),

  resetPreferences: () =>
    apiClient.post<{ success: boolean; data: NotificationPreferences }>(
      "/notifications/preferences/reset",
      {}
    ),

  // ─── Faculty follows ───

  getFollowing: () =>
    apiClient.get<FollowsResponse>("/notifications/follows"),

  getFollowers: () =>
    apiClient.get<FollowsResponse>("/notifications/follows/followers"),

  searchFaculty: (q: string) =>
    apiClient.get<FollowsResponse>("/notifications/follows/search", {
      params: { q },
    }),

  getFollowStatus: (facultyUserId: string) =>
    apiClient.get<FollowStatusResponse>(
      `/notifications/follows/status/${facultyUserId}`
    ),

  follow: (facultyUserId: string) =>
    apiClient.post<{ success: boolean }>(`/notifications/follows/${facultyUserId}`, {}),

  unfollow: (facultyUserId: string) =>
    apiClient.delete<{ success: boolean }>(`/notifications/follows/${facultyUserId}`),
};
