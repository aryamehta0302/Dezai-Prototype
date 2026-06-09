"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useProgress } from "@/features/learning/hooks/useProgress";
import { userService } from "../services/user.service";

export function useProfile() {
  const { user } = useAuthStore();
  const { stats } = useProgress();

  const activity = useMemo(
    () => (user ? userService.getRecentActivity(user.id) : []),
    [user]
  );

  return { user, stats, activity };
}
