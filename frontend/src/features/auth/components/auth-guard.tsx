"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/shared/types/common.types";
import { isAuthorizedForPath, getRoutePermission } from "@/core/auth/route-permissions";
import { getDashboardForRole } from "@/core/auth/permissions";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Explicit role override. If omitted, uses route-permissions.ts */
  allowedRoles?: UserRole[];
  fallbackUrl?: string;
}

/**
 * AuthGuard — Client-side route protection.
 *
 * Uses centralized route-permissions.ts for RBAC decisions.
 * Layouts wrap their children with this component.
 *
 * The middleware handles auth gating (logged in / onboarded).
 * AuthGuard handles role-based access within authenticated routes.
 */
export function AuthGuard({
  children,
  allowedRoles,
  fallbackUrl,
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // Not authenticated — middleware should catch this, but safety net
    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const userRole = session.user.role as UserRole;

    // Determine allowed roles: explicit prop > route-permissions config
    if (allowedRoles) {
      if (!allowedRoles.includes(userRole)) {
        router.replace(fallbackUrl ?? getDashboardForRole(userRole));
      }
      return;
    }

    // Use centralized route permissions
    const pathname = window.location.pathname;
    if (!isAuthorizedForPath(pathname, userRole)) {
      const rule = getRoutePermission(pathname);
      router.replace(rule?.deniedRedirect ?? getDashboardForRole(userRole));
    }
  }, [session, status, allowedRoles, fallbackUrl, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) return null;

  // Role check (explicit allowedRoles prop)
  if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
    return null;
  }

  // Role check (route-permissions)
  if (!allowedRoles) {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    if (pathname && !isAuthorizedForPath(pathname, session.user.role as UserRole)) {
      return null;
    }
  }

  return <>{children}</>;
}
