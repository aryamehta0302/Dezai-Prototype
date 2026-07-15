"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { EnterpriseSidebar } from "@/features/enterprise/components/layout/enterprise-sidebar";
import { TopAppBar } from "@/shared/components/top-app-bar";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useEffect, useRef } from "react";
import { UserRole } from "@/shared/types/common.types";

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { unreadCount, initialize } = useNotificationStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    initialize();
  }, []);

  const getVariant = () => {
    if (!user) return "default";
    switch (user.role) {
      case UserRole.ORGANIZATION_ADMIN:
      case UserRole.ORGANIZATION_MANAGER:
        return "enterprise";
      case UserRole.EMPLOYEE:
        return "employee";
      default:
        return "default";
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Enterprise Specific Sidebar */}
        <EnterpriseSidebar 
          onLogout={logout}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
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
          <main className="flex-1 overflow-y-auto bg-surface-low/30">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
