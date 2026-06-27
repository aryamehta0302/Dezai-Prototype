"use client";

import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { formatDate } from "@/shared/utils/format";

export function NotificationWidget() {
  const { notifications, unreadCount, markAllAsRead } =
    useNotificationStore();

  const recentUnread = notifications
    .filter((n) => !n.read)
    .slice(0, 5);

  return (
    <div className="card-elevation p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Notifications
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      {recentUnread.length > 0 ? (
        <div className="space-y-3">
          {recentUnread.map((n) => (
            <div key={n.id} className="space-y-0.5">
              {n.actionUrl ? (
                <Link
                  href={n.actionUrl}
                  className="text-sm font-medium text-on-surface hover:text-primary transition-colors block truncate"
                >
                  {n.title}
                </Link>
              ) : (
                <p className="text-sm font-medium text-on-surface truncate">
                  {n.title}
                </p>
              )}
              <p className="text-xs text-muted truncate">{n.message}</p>
              <p className="text-2xs text-muted">
                {formatDate(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted text-center py-4">
          No unread notifications
        </p>
      )}

      {notifications.length > 0 && (
        <Link
          href="/settings"
          className="block text-xs text-primary hover:underline text-center pt-1"
        >
          View all notifications
        </Link>
      )}
    </div>
  );
}
