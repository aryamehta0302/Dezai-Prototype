"use client";

import { cn } from "@/shared/utils/cn";
import { Progress } from "@/shared/ui/progress";
import { Clock, Sun, Moon, CalendarDays, Activity, BarChart3 } from "lucide-react";
import type { LearningPattern } from "../types/learning-intelligence.types";

interface LearningPatternCardProps {
  pattern: LearningPattern;
  className?: string;
}

export function LearningPatternCard({ pattern, className }: LearningPatternCardProps) {
  const periodLabel =
    pattern.mostActiveHour >= 5 && pattern.mostActiveHour < 12
      ? "Morning"
      : pattern.mostActiveHour >= 12 && pattern.mostActiveHour < 17
        ? "Afternoon"
        : pattern.mostActiveHour >= 17 && pattern.mostActiveHour < 21
          ? "Evening"
          : "Night";

  const PeriodIcon = pattern.mostActiveHour >= 5 && pattern.mostActiveHour < 17 ? Sun : Moon;

  return (
    <div className={cn("card-elevation p-5 space-y-5", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Learning Patterns
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 p-3 rounded-lg bg-surface-low/50">
          <div className="flex items-center gap-2 text-xs text-muted">
            <PeriodIcon className="h-3.5 w-3.5" />
            Peak Time
          </div>
          <p className="text-lg font-bold text-on-surface">{periodLabel}</p>
          <p className="text-[10px] text-muted">{pattern.mostActiveHour}:00 — most active hour</p>
        </div>

        <div className="space-y-2 p-3 rounded-lg bg-surface-low/50">
          <div className="flex items-center gap-2 text-xs text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Best Day
          </div>
          <p className="text-lg font-bold text-on-surface">{pattern.mostActiveDay}</p>
          <p className="text-[10px] text-muted">Most consistent day</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3" />
            Consistency Score
          </span>
          <span className="font-bold text-on-surface">{pattern.consistencyScore}%</span>
        </div>
        <Progress value={pattern.consistencyScore} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Avg Session
          </span>
          <span className="font-bold text-on-surface">
            {pattern.averageSessionDurationMinutes > 0
              ? `${pattern.averageSessionDurationMinutes} min`
              : 'N/A'}
          </span>
        </div>
      </div>

      {pattern.weeklyActivity.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted">Weekly Activity</p>
          <div className="flex gap-1">
            {pattern.weeklyActivity.map((day) => {
              const maxCount = Math.max(...pattern.weeklyActivity.map((d) => d.count), 1);
              const height = Math.max((day.count / maxCount) * 40, 4);
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-primary/30"
                    style={{ height: `${height}px` }}
                    title={`${day.day}: ${day.count} activities`}
                  />
                  <span className="text-[8px] text-muted uppercase">{day.day.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted italic">{pattern.patternSummary}</p>
    </div>
  );
}
