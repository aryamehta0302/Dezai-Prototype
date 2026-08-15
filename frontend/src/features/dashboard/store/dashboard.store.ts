"use client";

import { create } from "zustand";
import { apiClient } from "@/core/api/client";

interface DashboardState {
  weeklyRank: number | null;
  showAllMilestones: boolean;
  showAllRecs: boolean;

  fetchWeeklyRank: () => Promise<void>;
  toggleMilestones: () => void;
  toggleRecs: () => void;
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  weeklyRank: null,
  showAllMilestones: false,
  showAllRecs: false,

  fetchWeeklyRank: async () => {
    try {
      const res = await apiClient.get<{ rank?: number }>(
        "/leaderboards/widgets/student"
      );
      if (res?.rank) {
        set({ weeklyRank: res.rank });
      }
    } catch {
      // Non-critical — silently ignore
    }
  },

  toggleMilestones: () =>
    set((state) => ({ showAllMilestones: !state.showAllMilestones })),

  toggleRecs: () =>
    set((state) => ({ showAllRecs: !state.showAllRecs })),
}));
