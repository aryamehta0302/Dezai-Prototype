"use client";

import { useEmployeeDashboard } from "../hooks/useEmployeeDashboard";
import { useEmployeeTimeline } from "../hooks/useEmployeeTimeline";
import { EmployeeStatsWidget } from "./widgets/EmployeeStatsWidget";
import { EmployeeProgressWidget } from "./widgets/EmployeeProgressWidget";
import { EmployeeRecentActivityWidget } from "./widgets/EmployeeRecentActivityWidget";
import { EmployeeCredentialsWidget } from "./widgets/EmployeeCredentialsWidget";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { employeeLearningService } from "../services/employee-learning.service";
import { Loader2 } from "lucide-react";

export function EmployeeDashboard() {
  const { data: stats, loading: statsLoading, error: statsError } = useEmployeeDashboard();
  const { events, loading: timelineLoading } = useEmployeeTimeline(10);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          {statsError || "Failed to load dashboard"}
        </p>
      </div>
    );
  }

  const level = employeeLearningService.calculateLevel(stats.totalXpEarned);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Learning Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your compliance training progress and achievements
        </p>
      </div>

      <LevelProgressCard
        xp={stats.totalXpEarned}
        levelInfo={{
          level: level.level,
          currentLevelXp: level.currentXp,
          nextLevelXp: level.nextLevelXp,
          progress: level.progress,
        }}
      />

      <EmployeeStatsWidget stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <EmployeeProgressWidget tracks={stats.trackProgress} />
        <EmployeeRecentActivityWidget events={events} loading={timelineLoading} />
      </div>
    </div>
  );
}
