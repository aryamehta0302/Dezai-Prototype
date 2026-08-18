"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TopAppBar } from "@/shared/components/top-app-bar";
import { UserRole } from "@/shared/types/common.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { AchievementNotificationWatcher } from "@/features/achievements/components/achievement-notification-watcher";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { unreadCount, initialize } = useNotificationStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const getVariant = () => {
    if (!user) return "default";
    switch (user.role) {
      case UserRole.DEZAI_ADMIN:
        return "admin";
      case UserRole.FACULTY:
      case UserRole.UNIVERSITY_ADMIN:
        return "university";
      case UserRole.ORGANIZATION_ADMIN:
      case UserRole.ORGANIZATION_MANAGER:
        return "enterprise";
      case UserRole.EMPLOYEE:
        return "employee";
      default:
        return "student";
    }
  };

  return (
    <AuthGuard>
      <AchievementNotificationWatcher />
      <div className="flex min-h-screen flex-col">
        <TopAppBar
          variant={getVariant()}
          user={
            user
              ? {
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
              }
              : null
          }
          onLogout={logout}
          notificationCount={unreadCount}
        />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </AuthGuard>
  );
}
