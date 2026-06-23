import { apiClient } from '@/core/api/client';
import type { Achievement, AchievementStats } from '../types/achievement.types';

interface AchievementListResponse {
  success: boolean;
  data: Achievement[];
}

interface AchievementStatsResponse {
  success: boolean;
  data: AchievementStats;
}

interface AchievementRecentResponse {
  success: boolean;
  data: Achievement[];
}

interface CheckResponse {
  success: boolean;
  results?: { achievementKey: string; title: string; xpReward: number; newlyUnlocked: boolean }[];
}

export const achievementsApi = {
  getAll: (params?: { category?: string; unlocked?: string }) =>
    apiClient.get<AchievementListResponse>('/achievements', params ? { params } : undefined),

  getRecent: (limit = 5) =>
    apiClient.get<AchievementRecentResponse>('/achievements/recent', { params: { limit: String(limit) } }),

  getStats: () =>
    apiClient.get<AchievementStatsResponse>('/achievements/stats'),

  triggerCheck: (category: string) =>
    apiClient.get<CheckResponse>(`/achievements/check/${category}`),
};
