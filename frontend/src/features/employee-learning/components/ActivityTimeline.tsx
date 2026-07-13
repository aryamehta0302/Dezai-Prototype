"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { CheckCircle, XCircle, Clock, Award, Star, Trophy, StickyNote, Bookmark, Loader2 } from "lucide-react";
import type { ActivityEvent } from "../types/employee-learning.types";
import { employeeLearningService } from "../services/employee-learning.service";

interface Props {
  events: ActivityEvent[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
}

const ICON_MAP: Record<string, typeof CheckCircle> = {
  ASSESSMENT_PASSED: CheckCircle,
  ASSESSMENT_FAILED: XCircle,
  ASSESSMENT_STARTED: Clock,
  CREDENTIAL_EARNED: Award,
  XP_EARNED: Star,
  ACHIEVEMENT_UNLOCKED: Trophy,
  NOTE_CREATED: StickyNote,
  BOOKMARK_ADDED: Bookmark,
};

export function ActivityTimeline({ events, loading, hasMore, onLoadMore, total }: Props) {
  if (loading && events.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{total} events total</p>
      {events.map((event) => {
        const Icon = ICON_MAP[event.type] || Clock;
        const colorClass = employeeLearningService.getActivityColor(event.type);
        return (
          <div key={event.id} className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-1.5 ${colorClass}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{event.description}</p>
              <p className="text-xs text-muted-foreground">
                {employeeLearningService.formatTimeAgo(event.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
      {hasMore && (
        <Button variant="outline" size="sm" className="w-full" onClick={onLoadMore} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
        </Button>
      )}
    </div>
  );
}
