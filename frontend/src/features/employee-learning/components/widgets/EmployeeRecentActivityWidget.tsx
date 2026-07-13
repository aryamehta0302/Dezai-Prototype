"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Clock, CheckCircle, XCircle, Award, Star } from "lucide-react";
import Link from "next/link";
import type { ActivityEvent } from "../../types/employee-learning.types";
import { employeeLearningService } from "../../services/employee-learning.service";

interface Props {
  events: ActivityEvent[];
  loading: boolean;
}

const ICON_MAP: Record<string, typeof CheckCircle> = {
  ASSESSMENT_PASSED: CheckCircle,
  ASSESSMENT_FAILED: XCircle,
  ASSESSMENT_STARTED: Clock,
  CREDENTIAL_EARNED: Award,
  XP_EARNED: Star,
};

export function EmployeeRecentActivityWidget({ events, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recent = events.slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activity yet. Start a compliance assessment!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        <Link href="/learning/timeline" className="text-xs text-blue-600 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((event) => {
          const Icon = ICON_MAP[event.type] || Clock;
          const colorClass = employeeLearningService.getActivityColor(event.type);
          return (
            <div key={event.id} className="flex items-center gap-3">
              <div className={`rounded-full p-1.5 ${colorClass}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{event.description}</p>
                <p className="text-xs text-muted-foreground">
                  {employeeLearningService.formatTimeAgo(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
