"use client";

import { useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/shared/types/common.types";
import { getDashboardForRole } from "@/core/auth/permissions";
import { toast } from "sonner";

/**
 * useAuth — Primary auth hook for client components.
 *
 * Bridges NextAuth session ↔ Zustand store.
 * Provides login/logout actions, role checks, and session sync.
 */
export function useAuth() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    syncSession,
    clearSession,
    setLoading,
    isStudent,
    isFaculty,
    isUniversityAdmin,
    isDezaiAdmin,
    hasRole,
  } = useAuthStore();

  // Sync NextAuth session → Zustand store
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      syncSession({
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role ?? UserRole.STUDENT,
        image: session.user.image ?? undefined,
        avatar: session.user.image ?? undefined,
        onboarded: session.user.onboarded ?? false,
      });
    } else if (status === "unauthenticated") {
      clearSession();
    }
  }, [
    session?.user?.id,
    session?.user?.role,
    session?.user?.email,
    session?.user?.name,
    session?.user?.image,
    session?.user?.onboarded,
    status,
    syncSession,
    clearSession
  ]);

  /**
   * Sign in with a provider (provider-agnostic).
   * Defaults to Google. Future: pass provider id dynamically.
   */
  const login = useCallback(
    async (providerId: string = "google") => {
      setLoading(true);
      try {
        await signIn(providerId, { callbackUrl: "/onboarding" });
      } catch {
        setLoading(false);
        toast.error("Sign-in failed. Please try again.");
      }
    },
    [setLoading]
  );

  /**
   * Sign out and redirect to login.
   */
  const logout = useCallback(async () => {
    clearSession();
    await signOut({ callbackUrl: "/login" });
    toast.success("Signed out successfully");
  }, [clearSession]);

  /**
   * Complete onboarding — update session with assigned role.
   */
  const completeOnboarding = useCallback(
    async (role: UserRole) => {
      try {
        // Update the NextAuth session with the new role
        await updateSession({ role, onboarded: true });

        toast.success("Welcome to Dezai!");
        router.push(getDashboardForRole(role));
      } catch {
        toast.error("Failed to complete onboarding. Please try again.");
      }
    },
    [updateSession, router]
  );

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    isSessionLoading: status === "loading",
    login,
    logout,
    completeOnboarding,
    isStudent,
    isFaculty,
    isUniversityAdmin,
    isDezaiAdmin,
    hasRole,
  };
}
