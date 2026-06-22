'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { achievementsApi } from './achievements-api.service';
import { apiClient } from '@/core/api/client';

const ACHIEVEMENT_KEYS = {
  all: () => ['achievements'] as const,
  list: (filters?: Record<string, string>) => ['achievements', 'list', filters] as const,
  stats: () => ['achievements', 'stats'] as const,
  recent: (limit?: number) => ['achievements', 'recent', limit] as const,
  userXp: () => ['achievements', 'user-xp'] as const,
};

interface UserXpResponse {
  success: boolean;
  xp: number;
  streakCount: number;
  level: {
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progress: number;
    totalXp: number;
  };
}

export function useAchievements(filters?: { category?: string; unlocked?: boolean }) {
  const params: Record<string, string> = {};
  if (filters?.category) params.category = filters.category;
  if (filters?.unlocked !== undefined) params.unlocked = String(filters.unlocked);

  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.list(Object.keys(params).length ? params : undefined),
    queryFn: () => achievementsApi.getAll(Object.keys(params).length ? params : undefined),
    select: (res) => res.data,
    staleTime: 30_000,
  });
}

export function useAchievementStats() {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.stats(),
    queryFn: () => achievementsApi.getStats(),
    select: (res) => res.data,
    staleTime: 30_000,
  });
}

export function useRecentAchievements(limit = 5) {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.recent(limit),
    queryFn: () => achievementsApi.getRecent(limit),
    select: (res) => res.data,
    staleTime: 15_000,
  });
}

export function useUserXp() {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.userXp(),
    queryFn: () => apiClient.get<UserXpResponse>('/users/me/xp'),
    select: (res) => res.level,
    staleTime: 30_000,
  });
}

export function useInvalidateAchievements() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.all() });
}
