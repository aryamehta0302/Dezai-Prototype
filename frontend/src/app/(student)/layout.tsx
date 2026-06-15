"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TopAppBar } from "@/shared/components/top-app-bar";
import { Footer } from "@/shared/components/footer";
import { UserRole } from "@/shared/types/common.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useEffect } from "react";

export default function StudentLayout({
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

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <TopAppBar
          variant="student"
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
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
