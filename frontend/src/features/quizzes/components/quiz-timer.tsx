"use client";

import { cn } from "@/shared/utils/cn";
import { Clock } from "lucide-react";
import { QUIZ_CONSTANTS } from "../constants/quiz.constants";

interface QuizTimerProps {
  formatted: string;
  timeRemaining: number;
}

export function QuizTimer({ formatted, timeRemaining }: QuizTimerProps) {
  const isWarning = timeRemaining <= QUIZ_CONSTANTS.WARNING_TIME_SECONDS;
  const isCritical = timeRemaining <= QUIZ_CONSTANTS.CRITICAL_TIME_SECONDS;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold transition-colors",
        isCritical
          ? "bg-destructive/10 text-destructive animate-pulse-warning"
          : isWarning
          ? "bg-warning/10 text-warning"
          : "bg-surface-low text-on-surface"
      )}
    >
      <Clock className="h-5 w-5" />
      {formatted}
    </div>
  );
}
