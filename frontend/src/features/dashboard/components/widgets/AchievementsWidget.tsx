"use client";

import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { AchievementGrid } from "@/features/achievements/components/achievement-grid";
import type { Achievement } from "@/features/achievements/types/achievement.types";

interface AchievementsWidgetProps {
  achievements: Achievement[];
  xp: number;
  unlockedCount: number;
  isLoading: boolean;
}

export function AchievementsWidget({
  achievements,
  xp,
  unlockedCount,
  isLoading,
}: AchievementsWidgetProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-on-surface">Achievements</h2>
        {!isLoading && (
          <span className="text-xs text-secondary">
            {unlockedCount} / {achievements.length} unlocked
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
        </div>
      ) : (
        <AchievementGrid achievements={achievements.slice(0, 3)} />
      )}
    </section>
  );
}
