"use client";

import { cn } from "@/shared/utils/cn";
import { Progress } from "@/shared/ui/progress";
import { TrendingUp, BrainCircuit } from "lucide-react";
import type { PredictionRule } from "../types/learning-intelligence.types";

interface PredictionRulesCardProps {
  rules: PredictionRule[];
  className?: string;
}

export function PredictionRulesCard({ rules, className }: PredictionRulesCardProps) {
  if (rules.length === 0) {
    return (
      <div className={cn("card-elevation p-5 text-center", className)}>
        <TrendingUp className="h-8 w-8 text-muted mx-auto mb-2" />
        <p className="text-sm font-medium text-on-surface">No predictions available</p>
        <p className="text-xs text-muted mt-1">Complete more assessments to get started.</p>
      </div>
    );
  }

  return (
    <div className={cn("card-elevation p-5 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-sm text-on-surface">Progress Prediction</h3>
      </div>
      <div className="space-y-3">
        {rules.slice(0, 5).map((rule, idx) => (
          <div key={`${rule.rule}-${idx}`} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-on-surface truncate">{rule.rule}</span>
              <span className="font-bold shrink-0 ml-2 text-muted">
                {rule.confidence}%
              </span>
            </div>
            <Progress
              value={rule.confidence}
              className="h-1.5 bg-primary/20"
            />
            <p className="text-[10px] text-muted leading-relaxed">{rule.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
