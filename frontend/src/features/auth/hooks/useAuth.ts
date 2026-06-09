"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { authService } from "../services/auth.service";
import { UserRole } from "@/shared/types/common.types";
import type { LoginCredentials, SignupData } from "../types/auth.types";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    isStudent,
    isUniversityAdmin,
    isDezaiAdmin,
    hasRole,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      const result = await authService.login(credentials);

      if (result.success && result.user) {
        storeLogin(result.user);
        toast.success(`Welcome back, ${result.user.name.split(" ")[0]}!`);

        // Route by role
        switch (result.user.role) {
          case UserRole.STUDENT:
            router.push("/dashboard");
            break;
          case UserRole.UNIVERSITY_ADMIN:
            router.push("/university/dashboard");
            break;
          case UserRole.DEZAI_ADMIN:
            router.push("/admin/dashboard");
            break;
        }
      } else {
        setLoading(false);
        toast.error(result.error || "Login failed");
      }

      return result;
    },
    [storeLogin, setLoading, router]
  );

  const signup = useCallback(
    async (data: SignupData) => {
      setLoading(true);
      const result = await authService.signup(data);

      if (result.success && result.user) {
        storeLogin(result.user);
        toast.success("Account created successfully!");
        router.push("/dashboard");
      } else {
        setLoading(false);
        toast.error(result.error || "Signup failed");
      }

      return result;
    },
    [storeLogin, setLoading, router]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    storeLogout();
    toast.success("Signed out successfully");
    router.push("/login");
  }, [storeLogout, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    isStudent,
    isUniversityAdmin,
    isDezaiAdmin,
    hasRole,
  };
}
