"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TopAppBar } from "@/shared/components/top-app-bar";

import { UserRole } from "@/shared/types/common.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useEffect, useRef } from "react";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { AchievementNotificationWatcher } from "@/features/achievements/components/achievement-notification-watcher";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { unreadCount, initialize } = useNotificationStore();
  const { fetchEnrollments, fetchStats } = useEnrollmentStore();
  const { fetchPrograms } = useProgramsStore();
  const pathname = usePathname();

  // Hide navbar during assessment taking (not results/review)
  const hideNavbar = pathname
    ? /\/programs\/[^/]+\/assessment\/[^/]+$/.test(pathname)
    : false;

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    initialize();
    fetchEnrollments();
    fetchStats();
    fetchPrograms();
  }, []);

  const getVariant = () => {
    if (!user) return "default";
    switch (user.role) {
      case UserRole.DEZAI_ADMIN: return "admin";
      case UserRole.FACULTY:
      case UserRole.UNIVERSITY_ADMIN: return "university";
      case UserRole.ORGANIZATION_ADMIN:
      case UserRole.ORGANIZATION_MANAGER: return "enterprise";
      case UserRole.EMPLOYEE: return "employee";
      default: return "student";
    }
  };

  return (
    <AuthGuard>
      <AchievementNotificationWatcher />
      <div className="flex min-h-screen flex-col">
        {!hideNavbar && (
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
        )}
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </AuthGuard>
  );
}
