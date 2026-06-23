"use client";

import { cn } from "@/shared/utils/cn";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react";
import type { StudentInsight } from "../types/learning-intelligence.types";

const severityStyles: Record<string, string> = {
  positive: "bg-success/10 border-success/20 text-success",
  neutral: "bg-surface-low border-border-light text-muted",
  negative: "bg-destructive/10 border-destructive/20 text-destructive",
};

const typeIcons: Record<string, React.ElementType> = {
  PERFORMANCE: BarChart3,
  PATTERN: Lightbulb,
  MILESTONE: Target,
  COMPARISON: TrendingUp,
  WARNING: AlertTriangle,
  ENCOURAGEMENT: Sparkles,
};

interface InsightCardProps {
  insight: StudentInsight;
  className?: string;
}

export function InsightCard({ insight, className }: InsightCardProps) {
  const Icon = typeIcons[insight.type] || Lightbulb;

  return (
    <div
      className={cn(
        "card-elevation p-4 flex items-start gap-3 border",
        severityStyles[insight.severity] || severityStyles.neutral,
        className,
      )}
    >
      <div className="rounded-lg p-2 shrink-0 bg-inherit">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-sm">{insight.title}</h4>
        <p className="text-xs opacity-80">{insight.message}</p>
      </div>
    </div>
  );
}
