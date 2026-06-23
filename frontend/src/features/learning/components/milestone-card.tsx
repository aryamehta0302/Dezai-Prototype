"use client";

import { cn } from "@/shared/utils/cn";
import { Progress } from "@/shared/ui/progress";
import {
  BookOpen,
  Library,
  ClipboardCheck,
  Award,
  GraduationCap,
  Trophy,
  Layers,
  Flame,
  Zap,
  Star,
  Crown,
} from "lucide-react";
import type { Milestone } from "../types/learning-intelligence.types";

const iconMap: Record<string, React.ElementType> = {
  BookOpen, Library, ClipboardCheck, Award, GraduationCap,
  Trophy, Layers, Flame, Zap, Star, Crown,
};

interface MilestoneCardProps {
  milestone: Milestone;
  className?: string;
}

export function MilestoneCard({ milestone, className }: MilestoneCardProps) {
  const Icon = iconMap[milestone.icon] || Star;

  return (
    <div
      className={cn(
        "card-elevation p-4 flex items-start gap-4 transition-all",
        milestone.isUnlocked
          ? "bg-primary/5 border border-primary/20"
          : "opacity-70",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-lg p-2.5 shrink-0",
          milestone.isUnlocked
            ? "bg-primary/15 text-primary"
            : "bg-surface-low text-muted",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm text-on-surface truncate">
            {milestone.title}
          </h4>
          {milestone.isUnlocked && (
            <span className="text-[10px] font-bold text-success uppercase tracking-wider shrink-0">
              Done
            </span>
          )}
        </div>
        <p className="text-xs text-muted">{milestone.description}</p>
        <div className="space-y-1">
          <Progress value={milestone.progress} className="h-1.5" />
          <p className="text-[10px] text-muted text-right">
            {milestone.current} / {milestone.target}
          </p>
        </div>
      </div>
    </div>
  );
}
