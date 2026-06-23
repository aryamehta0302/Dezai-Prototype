"use client";

import { cn } from "@/shared/utils/cn";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { BarChart3, Layers } from "lucide-react";
import type { DifficultyAnalysis } from "../types/learning-intelligence.types";

interface DifficultyAnalysisCardProps {
  analysis: DifficultyAnalysis[];
  className?: string;
}

const difficultyColors: Record<string, { bar: string; track: string; text: string }> = {
  EASY: { bar: "bg-green-500", track: "bg-green-500/20", text: "text-green-600" },
  MEDIUM: { bar: "bg-amber-500", track: "bg-amber-500/20", text: "text-amber-600" },
  HARD: { bar: "bg-red-500", track: "bg-red-500/20", text: "text-red-600" },
};

export function DifficultyAnalysisCard({ analysis, className }: DifficultyAnalysisCardProps) {
  if (analysis.length === 0) {
    return (
      <div className={cn("card-elevation p-5 text-center", className)}>
        <BarChart3 className="h-8 w-8 text-muted mx-auto mb-2" />
        <p className="text-sm font-medium text-on-surface">No difficulty data yet</p>
        <p className="text-xs text-muted mt-1">Complete assessments across different levels.</p>
      </div>
    );
  }

  return (
    <div className={cn("card-elevation p-5 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-sm text-on-surface">Difficulty Breakdown</h3>
      </div>
      <div className="space-y-3">
        {analysis.map((item) => {
          const colors = difficultyColors[item.difficulty] ?? difficultyColors.MEDIUM;
          return (
            <div key={item.difficulty} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <Badge variant="outline" className={cn("rounded-md px-2 font-semibold", colors.text)}>
                  {item.difficulty}
                </Badge>
                <span className={cn("font-bold shrink-0 ml-2", colors.text)}>
                  {item.accuracy}%
                </span>
              </div>
              <Progress
                value={item.accuracy}
                className={cn("h-2", colors.track)}
              />
              <p className="text-[10px] text-muted">
                {item.correctAttempts}/{item.totalAttempts} correct
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
