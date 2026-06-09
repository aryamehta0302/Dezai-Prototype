"use client";

import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface QuizNavigationBarProps {
  currentIndex: number;
  totalQuestions: number;
  isFlagged: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFlag: () => void;
  onSubmit: () => void;
}

export function QuizNavigationBar({
  currentIndex,
  totalQuestions,
  isFlagged,
  onPrev,
  onNext,
  onFlag,
  onSubmit,
}: QuizNavigationBarProps) {
  const isLast = currentIndex >= totalQuestions - 1;

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="gap-1.5"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <Button
        variant="ghost"
        onClick={onFlag}
        className={cn(
          "gap-1.5",
          isFlagged && "text-warning"
        )}
      >
        <Flag className={cn("h-4 w-4", isFlagged && "fill-warning")} />
        {isFlagged ? "Flagged" : "Flag"}
      </Button>

      {isLast ? (
        <Button onClick={onSubmit} className="gap-1.5 bg-success hover:bg-success/90">
          Submit Quiz
        </Button>
      ) : (
        <Button onClick={onNext} className="gap-1.5">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
