"use client";

import { cn } from "@/shared/utils/cn";
import type { MockQuestion } from "@/lib/mock-data/quizzes";

interface QuestionNavigatorProps {
  questions: MockQuestion[];
  currentIndex: number;
  answers: Record<string, number | null>;
  flaggedQuestions: Set<string>;
  onGoToQuestion: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion,
}: QuestionNavigatorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-on-surface">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
          const isFlagged = flaggedQuestions.has(q.id);
          const isCurrent = i === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => onGoToQuestion(i)}
              className={cn(
                "relative h-9 w-9 rounded-lg text-xs font-semibold transition-all",
                isCurrent
                  ? "bg-primary text-white ring-2 ring-primary/30"
                  : isAnswered
                  ? "bg-success/10 text-success border border-success/30"
                  : "bg-surface-low text-muted hover:bg-surface-muted",
                isFlagged && !isCurrent && "ring-2 ring-warning"
              )}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted pt-2">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary" /> Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-success/20 border border-success/30" /> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-surface-low ring-2 ring-warning" /> Flagged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-surface-low" /> Unanswered
        </span>
      </div>
    </div>
  );
}
