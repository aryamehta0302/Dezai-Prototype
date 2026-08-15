"use client";

import { cn } from "@/shared/utils/cn";
import { Flame } from "lucide-react";
import type { StreakInfo } from "../types/learning-intelligence.types";

interface StreakHeatmapProps {
  streak: StreakInfo;
  className?: string;
}

export function StreakHeatmap({ streak, className }: StreakHeatmapProps) {
  return (
    <div className={cn("card-elevation p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Streak
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center">
            <p className="text-lg font-bold text-on-surface">{streak.currentStreak}</p>
            <p className="text-muted">Current</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-on-surface">{streak.longestStreak}</p>
            <p className="text-muted">Longest</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">Last 14 Days</p>
        <div className="flex gap-1 justify-center">
          {streak.streakHistory.map((day) => {
            const date = new Date(day.date);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full aspect-square rounded-sm",
                    day.active
                      ? "bg-orange-500"
                      : "bg-surface-low",
                  )}
                  style={{ width: '18px' }}
                  title={`${day.date}: ${day.active ? 'Active' : 'Inactive'}`}
                />
                <span className="text-[8px] text-muted">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
