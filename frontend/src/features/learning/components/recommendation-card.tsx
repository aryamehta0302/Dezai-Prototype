"use client";

import { cn } from "@/shared/utils/cn";
import {
  BookOpen,
  ClipboardCheck,
  ArrowRight,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LearningRecommendation } from "../types/learning-intelligence.types";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  REVIEW_MODULE: { icon: BookOpen, color: "text-info bg-info/10" },
  PRACTICE_ASSESSMENT: { icon: ClipboardCheck, color: "text-warning bg-warning/10" },
  NEXT_LESSON: { icon: ArrowRight, color: "text-primary bg-primary/10" },
  WEAK_TOPIC: { icon: Target, color: "text-destructive bg-destructive/10" },
  SPEED_IMPROVEMENT: { icon: TrendingUp, color: "text-purple-500 bg-purple-500/10" },
};

interface RecommendationCardProps {
  recommendation: LearningRecommendation;
  className?: string;
}

export function RecommendationCard({ recommendation, className }: RecommendationCardProps) {
  const config = typeConfig[recommendation.type] || { icon: ArrowRight, color: "text-muted bg-surface-low" };
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "card-elevation p-4 flex items-start gap-3 border-l-4",
        recommendation.type === 'WEAK_TOPIC' && "border-l-destructive",
        recommendation.type === 'PRACTICE_ASSESSMENT' && "border-l-warning",
        recommendation.type === 'NEXT_LESSON' && "border-l-primary",
        recommendation.type === 'REVIEW_MODULE' && "border-l-info",
        recommendation.type === 'SPEED_IMPROVEMENT' && "border-l-purple-500",
        className,
      )}
    >
      <div className={cn("rounded-lg p-2 shrink-0", config.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm text-on-surface">{recommendation.title}</h4>
          <span className="text-[10px] text-muted uppercase shrink-0">
            #{recommendation.priority}
          </span>
        </div>
        <p className="text-xs text-muted">{recommendation.description}</p>
      </div>
    </div>
  );
}
