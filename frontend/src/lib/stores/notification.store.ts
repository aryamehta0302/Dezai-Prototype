"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/core/api/client";

export type NotificationType = "REMINDER" | "CREDENTIAL" | "UPDATE" | "SYSTEM" | "ANNOUNCEMENT";

export interface Notification {
  id: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  archived?: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  initialize: () => void;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  archive: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      initialize: () => {
        apiClient
          .get<{ success: boolean; notifications: Notification[] }>("/notifications")
          .then((res) => {
            if (res.success && res.notifications) {
              const unread = res.notifications.filter((n) => !n.read).length;
              set({ notifications: res.notifications, unreadCount: unread });
            }
          })
          .catch(() => {
            // Non-critical — if the API fails, keep whatever is persisted
          });
      },

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read && !n.archived).length,
        }),

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read && !n.archived).length,
          };
        });
        // Fire API in background
        apiClient.patch(`/notifications/${id}/read`, {}).catch(() => {});
      },

      markAsUnread: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: false } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read && !n.archived).length,
          };
        });
        // Fire API in background
        apiClient.patch(`/notifications/${id}/unread`, {}).catch(() => {});
      },

      archive: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, archived: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read && !n.archived).length,
          };
        });
        // Fire API in background
        apiClient.patch(`/notifications/${id}/archive`, {}).catch(() => {});
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
        // Fire API in background
        apiClient.patch("/notifications/mark-all-read", {}).catch(() => {});
      },

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        })),
    }),
    {
      name: "dezai-notifications",
    }
  )
);
