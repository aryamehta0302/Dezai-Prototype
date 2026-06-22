'use client';

import { useMemo } from 'react';
import { useAchievements as useAchievementsQuery, useAchievementStats, useUserXp } from '../api/achievements-query.service';
import type { LevelInfo } from '../types/achievement.types';

export function useAchievementsData() {
  const { data: achievements, isLoading: achievementsLoading, error: achievementsError } = useAchievementsQuery();
  const { data: stats, isLoading: statsLoading, error: statsError } = useAchievementStats();
  const { data: levelInfo, isLoading: xpLoading } = useUserXp();

  const categoryCounts = useMemo(() => {
    if (!achievements) return {};
    const counts: Record<string, { total: number; unlocked: number }> = {};
    for (const a of achievements) {
      if (!counts[a.category]) counts[a.category] = { total: 0, unlocked: 0 };
      counts[a.category].total++;
      if (a.isUnlocked) counts[a.category].unlocked++;
    }
    return counts;
  }, [achievements]);

  return {
    achievements: achievements ?? [],
    stats: stats ?? { totalAchievements: 0, unlockedCount: 0, lockedCount: 0, totalXpEarned: 0 },
    levelInfo: levelInfo ?? null,
    categoryCounts,
    isLoading: achievementsLoading || statsLoading || xpLoading,
    error: achievementsError || statsError,
  };
}

export function useAchievements() {
  const { achievements, stats, isLoading } = useAchievementsData();

  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.isUnlocked).length,
    [achievements],
  );

  return {
    achievements,
    stats: {
      xp: stats.totalXpEarned,
      streakCount: 0,
      enrolledCourses: 0,
      completedCourses: 0,
      totalHours: 0,
      level: unlockedCount,
      nextLevelXp: 0,
      progressToNextLevel: 0,
    },
    unlockedCount,
    totalCount: stats.totalAchievements,
    isLoading,
  };
}
