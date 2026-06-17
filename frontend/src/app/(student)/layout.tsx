"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TopAppBar } from "@/shared/components/top-app-bar";
import { Footer } from "@/shared/components/footer";
import { UserRole } from "@/shared/types/common.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { unreadCount, initialize } = useNotificationStore();
  const { fetchEnrollments, fetchXp } = useEnrollmentStore();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
    fetchEnrollments();
    fetchXp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isProgramPage = pathname.startsWith("/programs/");

  const getVariant = () => {
    if (!user) return "default";
    switch (user.role) {
      case UserRole.DEZAI_ADMIN: return "admin";
      case UserRole.FACULTY:
      case UserRole.UNIVERSITY_ADMIN: return "university";
      default: return "student";
    }
  };

  return (
    <AuthGuard>
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
        <main className="flex-1 bg-surface-lowest">{children}</main>
        {!isProgramPage && <Footer />}
      </div>
    </AuthGuard>
  );
}
