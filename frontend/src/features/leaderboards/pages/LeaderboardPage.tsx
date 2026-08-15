"use client";

import { PageContainer } from "@/shared/components/page-container";
import { TopPerformerList } from "../components/top-performer-list";
import { Trophy, BarChart3, TrendingUp } from "lucide-react";

export function LeaderboardPage() {
  return (
    <PageContainer className="py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-on-surface">Leaderboard</h1>
        <p className="text-muted">See how you rank against peers globally, by institution, and within your programs.</p>
      </div>

      <TopPerformerList />
    </PageContainer>
  );
}
