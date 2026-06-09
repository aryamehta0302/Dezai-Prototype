"use client";

import { cn } from "@/shared/utils/cn";

interface CourseProgressPillProps {
  progress: number;
  className?: string;
}

export function CourseProgressPill({ progress, className }: CourseProgressPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        progress >= 100
          ? "bg-success-container text-success"
          : progress > 0
          ? "bg-primary/10 text-primary"
          : "bg-surface-low text-muted",
        className
      )}
    >
      {progress >= 100 ? "Completed" : `${progress}%`}
    </span>
  );
}
