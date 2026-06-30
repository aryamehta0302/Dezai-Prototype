"use client";

import { cn } from "@/shared/utils/cn";
import {
  BookOpen,
  ClipboardCheck,
  Trophy,
  Zap,
  Flame,
  Bookmark,
  GraduationCap,
  FileText,
  Clock,
} from "lucide-react";
import type { ActivityEvent } from "../types/learning-intelligence.types";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  LESSON_COMPLETED: { icon: BookOpen, color: "text-primary bg-primary/10" },
  ASSESSMENT_PASSED: { icon: Trophy, color: "text-success bg-success/10" },
  ASSESSMENT_FAILED: { icon: ClipboardCheck, color: "text-destructive bg-destructive/10" },
  ENROLLMENT: { icon: GraduationCap, color: "text-info bg-info/10" },
  PROGRAM_COMPLETED: { icon: Trophy, color: "text-warning bg-warning/10" },
  STREAK_MILESTONE: { icon: Flame, color: "text-orange-500 bg-orange-500/10" },
  XP_MILESTONE: { icon: Zap, color: "text-purple-500 bg-purple-500/10" },
  BOOKMARK_ADDED: { icon: Bookmark, color: "text-primary bg-primary/10" },
  NOTE_CREATED: { icon: FileText, color: "text-muted bg-surface-low" },
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Clock className="h-8 w-8 text-muted/20 mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm text-muted">No recent activity</p>
      </div>
    );
  }

  return (
    <ol className={cn("space-y-4", className)}>
      {events.map((event) => {
        const config = typeConfig[event.type] || { icon: Zap, color: "text-muted bg-surface-low" };
        const Icon = config.icon;

        return (
          <li key={event.id} className="flex gap-4">
            <div className={cn("rounded-full p-2 h-9 w-9 flex items-center justify-center shrink-0", config.color)}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1 pt-1">
              <p className="text-sm text-on-surface">{event.description}</p>
              <p className="text-[11px] text-muted">{formatTimeAgo(event.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
