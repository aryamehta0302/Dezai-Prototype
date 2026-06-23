"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/shared/types/common.types";
import { clearTokenCache } from "@/core/api/client";

/**
 * Auth Store — Client-side auth state
 *
 * Works alongside NextAuth's session. The session is the source of truth,
 * but the store provides role helpers and sync state for UI reactivity.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  avatar?: string;
  onboarded: boolean;
  xp?: number;
  streakCount?: number;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  syncSession: (user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;

  // Role helpers
  isStudent: () => boolean;
  isFaculty: () => boolean;
  isUniversityAdmin: () => boolean;
  isDezaiAdmin: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      syncSession: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setUser: (user) =>
        set({ user }),

      clearSession: () => {
        clearTokenCache();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      isStudent: () => get().user?.role === UserRole.STUDENT,
      isFaculty: () => get().user?.role === UserRole.FACULTY,
      isUniversityAdmin: () => get().user?.role === UserRole.UNIVERSITY_ADMIN,
      isDezaiAdmin: () => get().user?.role === UserRole.DEZAI_ADMIN,
      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: "dezai-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
