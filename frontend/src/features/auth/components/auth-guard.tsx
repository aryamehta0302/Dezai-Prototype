"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/shared/types/common.types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackUrl?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  fallbackUrl = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(fallbackUrl);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case UserRole.STUDENT:
          router.replace("/dashboard");
          break;
        case UserRole.UNIVERSITY_ADMIN:
          router.replace("/university/dashboard");
          break;
        case UserRole.DEZAI_ADMIN:
          router.replace("/admin/dashboard");
          break;
        default:
          router.replace("/login");
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, fallbackUrl]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
