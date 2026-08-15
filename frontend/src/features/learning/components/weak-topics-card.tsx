"use client";

import { cn } from "@/shared/utils/cn";
import { Progress } from "@/shared/ui/progress";
import { Target, AlertTriangle } from "lucide-react";
import type { WeakTopic } from "../types/learning-intelligence.types";

interface WeakTopicsCardProps {
  topics: WeakTopic[];
  className?: string;
}

export function WeakTopicsCard({ topics, className }: WeakTopicsCardProps) {
  if (topics.length === 0) {
    return (
      <div className={cn("card-elevation p-5 text-center", className)}>
        <Target className="h-8 w-8 text-success/30 mx-auto mb-2" />
        <p className="text-sm font-medium text-on-surface">No weak topics detected</p>
        <p className="text-xs text-muted mt-1">Keep up the great work!</p>
      </div>
    );
  }

  return (
    <div className={cn("card-elevation p-5 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h3 className="font-bold text-sm text-on-surface">Topics to Review</h3>
      </div>
      <div className="space-y-3">
        {topics.slice(0, 5).map((topic) => (
          <div key={topic.topic} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-on-surface truncate">{topic.topic}</span>
              <span
                className={cn(
                  "font-bold shrink-0 ml-2",
                  topic.accuracy < 40 ? "text-destructive" : topic.accuracy < 70 ? "text-warning" : "text-success",
                )}
              >
                {topic.accuracy}%
              </span>
            </div>
            <Progress
              value={topic.accuracy}
              className={cn(
                "h-1.5",
                topic.accuracy < 40 ? "bg-destructive/20" : topic.accuracy < 70 ? "bg-warning/20" : "bg-success/20",
              )}
            />
            <p className="text-[10px] text-muted">
              {topic.correctAttempts}/{topic.totalAttempts} correct
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
