"use client";

import {
  BookOpen,
  Trophy,
  Flame,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import type { DashboardStats } from "@/features/learning/types/learning.types";

interface StatsOverviewWidgetProps {
  stats: DashboardStats;
  globalRank: number | null;
  unlockedCount: number;
  isLoading: boolean;
}

export function StatsOverviewWidget({
  stats,
  globalRank,
  unlockedCount,
  isLoading,
}: StatsOverviewWidgetProps) {
  if (isLoading) {
    return <LoadingSkeleton className="h-64 rounded-xl" />;
  }

  return (
    <div className="card-elevation p-5 space-y-4">
      <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
        Overview
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 p-3 rounded-lg bg-surface-low">
          <span className="text-xs text-secondary flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" /> Enrolled
          </span>
          <p className="text-lg font-bold text-on-surface">
            {stats.enrolledCourses}
          </p>
        </div>
        <div className="space-y-1 p-3 rounded-lg bg-surface-low">
          <span className="text-xs text-secondary flex items-center gap-1.5">
            <Trophy className="h-3 w-3" /> Completed
          </span>
          <p className="text-lg font-bold text-on-surface">
            {stats.completedCourses}
          </p>
        </div>
        <div className="space-y-1 p-3 rounded-lg bg-surface-low">
          <span className="text-xs text-secondary flex items-center gap-1.5">
            <Flame className="h-3 w-3" /> Streak
          </span>
          <p className="text-lg font-bold text-on-surface">
            {stats.learningStreak}d
          </p>
        </div>
        <div className="space-y-1 p-3 rounded-lg bg-surface-low">
          <span className="text-xs text-secondary flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Hours
          </span>
          <p className="text-lg font-bold text-on-surface">
            {stats.hoursLearned}
          </p>
        </div>
        <div className="space-y-1 p-3 rounded-lg bg-surface-low">
          <span className="text-xs text-secondary flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Unlocked
          </span>
          <p className="text-lg font-bold text-on-surface">{unlockedCount}</p>
        </div>
        <div className="space-y-1 p-3 rounded-lg bg-surface-low">
          <span className="text-xs text-secondary flex items-center gap-1.5">
            <Award className="h-3 w-3" /> Rank
          </span>
          <p className="text-lg font-bold text-on-surface">
            #{globalRank ?? "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
