"use client";

import { memo } from "react";
import { StudentRankingCard } from "@/features/leaderboards/components/student-ranking-card";

interface LeaderboardWidgetProps {
  globalRank: number | null;
  weeklyRank: number | null;
  xp: number;
  streakCount: number;
}

export const LeaderboardWidget = memo(function LeaderboardWidget({
  globalRank,
  weeklyRank,
  xp,
  streakCount,
}: LeaderboardWidgetProps) {
  if (globalRank === null || globalRank <= 0) return null;

  return (
    <StudentRankingCard
      rank={globalRank}
      weeklyRank={weeklyRank}
      xp={xp}
      streakCount={streakCount}
    />
  );
});

