"use client";

import { cn } from "@/shared/utils/cn";
import { formatRelativeTime } from "@/shared/utils/format";
import {
  BookOpen,
  CheckCircle,
  Award,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import type { ActivityItem } from "../types/user.types";

const activityIcons = {
  enrollment: BookOpen,
  completion: CheckCircle,
  certificate: Award,
  quiz: HelpCircle,
  achievement: Sparkles,
  ENROLLMENT: BookOpen,
  COMPLETION: CheckCircle,
  XP: Sparkles,
  ACHIEVEMENT: Sparkles,
  PROGRESS: BookOpen,
};

const activityColors: Record<string, string> = {
  enrollment: "text-primary bg-primary/10",
  completion: "text-success bg-success/10",
  certificate: "text-warning bg-warning/10",
  quiz: "text-info bg-info/10",
  achievement: "text-secondary bg-secondary/10",
  ENROLLMENT: "text-primary bg-primary/10",
  COMPLETION: "text-success bg-success/10",
  XP: "text-warning bg-warning/10",
  ACHIEVEMENT: "text-secondary bg-secondary/10",
  PROGRESS: "text-info bg-info/10",
};

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="card-elevation p-6 space-y-4">
      <h3 className="font-semibold text-on-surface">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || BookOpen;
          const color = activityColors[activity.type] || "text-muted bg-surface-low";

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0", color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface">{activity.title}</p>
                <p className="text-xs text-muted">{activity.description}</p>
              </div>
              <span className="text-xs text-muted flex-shrink-0">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
