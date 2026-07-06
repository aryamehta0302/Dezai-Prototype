"use client";

import { StudentRankingCard } from "@/features/leaderboards/components/student-ranking-card";

interface LeaderboardWidgetProps {
  globalRank: number | null;
  weeklyRank: number | null;
  xp: number;
  streakCount: number;
}

export function LeaderboardWidget({
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
}
