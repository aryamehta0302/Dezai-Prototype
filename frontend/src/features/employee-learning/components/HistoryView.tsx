"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Bookmark, StickyNote, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { COMPLIANCE_TRACK_LABELS } from "../types/employee-learning.types";
import { employeeLearningService } from "../services/employee-learning.service";
import type { HistoryData } from "../types/employee-learning.types";

interface Props {
  history: HistoryData;
  loading: boolean;
}

export function HistoryView({ history, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">{history.summary.totalAttempts}</div>
          <div className="text-xs text-muted-foreground">Total Attempts</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600">{history.summary.passedAttempts}</div>
          <div className="text-xs text-muted-foreground">Passed</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{history.summary.totalCredentials}</div>
          <div className="text-xs text-muted-foreground">Credentials</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{history.summary.activeCredentials}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Assessment Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {history.attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attempts yet.</p>
          ) : (
            <div className="space-y-2">
              {history.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {attempt.passed ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{attempt.assessmentTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {COMPLIANCE_TRACK_LABELS[attempt.complianceTrack]} &middot;{" "}
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={attempt.passed ? "default" : "destructive"}>
                      {attempt.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Credentials Earned</CardTitle>
        </CardHeader>
        <CardContent>
          {history.credentials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No credentials earned yet.</p>
          ) : (
            <div className="space-y-2">
              {history.credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {cred.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {COMPLIANCE_TRACK_LABELS[cred.complianceTrack]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Issued {new Date(cred.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <code className="text-xs text-muted-foreground">{cred.verificationCode}</code>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
