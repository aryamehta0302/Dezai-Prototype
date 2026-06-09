"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/shared/types/common.types";
import type { MockUser } from "@/lib/mock-data/students";

export interface AuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: MockUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Role helpers
  isStudent: () => boolean;
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

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      isStudent: () => get().user?.role === UserRole.STUDENT,
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
