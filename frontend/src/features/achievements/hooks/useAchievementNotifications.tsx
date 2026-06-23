'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { achievementsApi } from '../api/achievements-api.service';
import { useInvalidateAchievements } from '../api/achievements-query.service';
import { toast } from 'sonner';
import { AchievementToastContent } from '../components/achievement-toast';
import type { Achievement } from '../types/achievement.types';

export function useAchievementNotifications() {
  const invalidate = useInvalidateAchievements();
  const notifiedKeys = useRef<Set<string>>(new Set());
  const [lastChecked] = useState(() => new Date());

  const { data: newUnlocks } = useQuery({
    queryKey: ['achievements', 'notifications', lastChecked.toISOString()],
    queryFn: async () => {
      const res = await achievementsApi.getRecent(10);
      return res.data.filter((a) => {
        if (!a.unlockedAt) return false;
        const unlockedDate = new Date(a.unlockedAt);
        return unlockedDate >= lastChecked && !notifiedKeys.current.has(a.key);
      });
    },
    refetchInterval: 15_000,
    enabled: typeof window !== 'undefined',
  });

  const notify = useCallback((achievement: Achievement) => {
    if (notifiedKeys.current.has(achievement.key)) return;
    notifiedKeys.current.add(achievement.key);

    toast.custom(
      () => (
        <AchievementToastContent
          title={achievement.title}
          description={achievement.description}
          icon={achievement.icon}
          rarity={achievement.rarity}
          xpReward={achievement.xpReward}
        />
      ),
      { duration: 5000 },
    );
  }, []);

  useEffect(() => {
    if (!newUnlocks?.length) return;
    for (const achievement of newUnlocks) {
      notify(achievement);
    }
    invalidate();
  }, [newUnlocks, notify, invalidate]);
}
