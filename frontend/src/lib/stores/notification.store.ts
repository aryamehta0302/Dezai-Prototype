"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockNotifications, type MockNotification } from "@/lib/mock-data/notifications";

export interface NotificationState {
  notifications: MockNotification[];
  unreadCount: number;

  initialize: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: MockNotification) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      initialize: () => {
        if (get().notifications.length === 0) {
          const unread = mockNotifications.filter((n) => !n.read).length;
          set({ notifications: mockNotifications, unreadCount: unread });
        }
      },

      markAsRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

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
