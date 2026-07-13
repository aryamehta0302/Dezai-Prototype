"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import { AssessmentList } from "../components/AssessmentList";
import type { TrackDetail } from "../types/employee-learning.types";
import { COMPLIANCE_TRACK_LABELS, ComplianceTrack } from "../types/employee-learning.types";
import { useEmployeeProgress } from "../hooks/useEmployeeProgress";

export default function EmployeeProgressPage() {
  const searchParams = useSearchParams();
  const activeTrack = searchParams.get("track");
  const { tracks, loading: tracksLoading } = useEmployeeProgress();
  const [trackDetail, setTrackDetail] = useState<TrackDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (activeTrack) {
      setDetailLoading(true);
      employeeLearningApi
        .getTrackProgress(activeTrack)
        .then((res) => setTrackDetail(res as unknown as TrackDetail))
        .finally(() => setDetailLoading(false));
    } else {
      setTrackDetail(null);
    }
  }, [activeTrack]);

  if (tracksLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-center gap-3">
        {activeTrack && (
          <Link href="/learning">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              All Tracks
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTrack && trackDetail ? trackDetail.label : "Compliance Progress"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeTrack && trackDetail
              ? `${trackDetail.passedAssessments}/${trackDetail.totalAssessments} assessments passed`
              : "Track your compliance training progress across all areas"}
          </p>
        </div>
      </div>

      {activeTrack && trackDetail ? (
        detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold">{trackDetail.totalAssessments}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{trackDetail.passedAssessments}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{trackDetail.credentialsEarned}</div>
                <div className="text-xs text-muted-foreground">Credentials</div>
              </Card>
            </div>
          </div>
        )
      ) : null}

      {!activeTrack ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {tracks.map((track) => (
            <Link key={track.track} href={`/learning?track=${track.track}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{track.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {track.passedAssessments}/{track.totalAssessments} passed
                      </p>
                    </div>
                    <Badge variant={track.completionPercentage === 100 ? "default" : "secondary"}>
                      {track.completionPercentage}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
