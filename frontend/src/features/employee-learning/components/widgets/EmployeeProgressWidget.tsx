"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { Shield, Lock, Eye, Mail } from "lucide-react";
import Link from "next/link";
import type { TrackProgress } from "../../types/employee-learning.types";
import { ComplianceTrack } from "../../types/employee-learning.types";

const TRACK_ICONS: Record<ComplianceTrack, typeof Shield> = {
  [ComplianceTrack.CYBER_SECURITY]: Shield,
  [ComplianceTrack.PASSWORD_SECURITY]: Lock,
  [ComplianceTrack.DATA_PRIVACY]: Eye,
  [ComplianceTrack.SECURE_EMAIL]: Mail,
};

const TRACK_COLORS: Record<ComplianceTrack, string> = {
  [ComplianceTrack.CYBER_SECURITY]: "from-blue-500 to-blue-600",
  [ComplianceTrack.PASSWORD_SECURITY]: "from-amber-500 to-amber-600",
  [ComplianceTrack.DATA_PRIVACY]: "from-emerald-500 to-emerald-600",
  [ComplianceTrack.SECURE_EMAIL]: "from-violet-500 to-violet-600",
};

interface Props {
  tracks: TrackProgress[];
}

export function EmployeeProgressWidget({ tracks }: Props) {
  if (tracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Compliance Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No compliance tracks assigned.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Compliance Tracks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tracks.map((track) => {
          const Icon = TRACK_ICONS[track.track] || Shield;
          return (
            <Link
              key={track.track}
              href={`/learning/progress?track=${track.track}`}
              className="group block space-y-2 rounded-lg border p-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-md bg-gradient-to-br p-1.5 ${TRACK_COLORS[track.track]}`}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{track.label}</span>
                </div>
                <Badge
                  variant={track.completionPercentage === 100 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {track.completionPercentage}%
                </Badge>
              </div>
              <Progress value={track.completionPercentage} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{track.passedAssessments}/{track.totalAssessments} passed</span>
                <span>{track.credentialsEarned} credential{track.credentialsEarned !== 1 ? "s" : ""}</span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
