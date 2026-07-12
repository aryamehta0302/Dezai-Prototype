"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Clock, FileText, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { AssessmentWithStatus } from "../types/employee-learning.types";
import { COMPLIANCE_TRACK_LABELS } from "../types/employee-learning.types";
import { employeeLearningService } from "../services/employee-learning.service";

interface Props {
  assessments: AssessmentWithStatus[];
}

export function AssessmentList({ assessments }: Props) {
  if (assessments.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          No compliance assessments available for your organization.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {assessments.map((a) => {
        const statusLabel = employeeLearningService.getAssessmentStatusLabel(a);
        const statusColor = employeeLearningService.getAssessmentStatusColor(a);
        const attemptsLeft = a.maxAttempts - a.attemptsUsed;
        const canAttempt = attemptsLeft > 0 && !a.hasActiveAttempt;

        return (
          <Card key={a.id} className="relative overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {COMPLIANCE_TRACK_LABELS[a.complianceTrack]}
                  </CardDescription>
                </div>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {a.timeLimitEnabled ? employeeLearningService.formatDuration(a.timeLimit) : "No limit"}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {a.sampleSize} questions
                </div>
                <div>
                  Passing: {a.passingScore}%
                </div>
                <div>
                  Attempts: {a.attemptsUsed}/{a.maxAttempts}
                </div>
              </div>

              {a.bestPercentage !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Best score</span>
                    <span className="font-medium">{a.bestPercentage}%</span>
                  </div>
                  <Progress value={a.bestPercentage} className="h-1" />
                </div>
              )}

              {canAttempt ? (
                <Link href={`/learning/${a.id}`}>
                  <Button className="w-full" size="sm">
                    {a.attemptsUsed === 0 ? "Start Assessment" : "Retry Assessment"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              ) : a.everPassed ? (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Assessment completed successfully
                </div>
              ) : attemptsLeft === 0 ? (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Maximum attempts reached
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Clock className="h-3.5 w-3.5" />
                  Active attempt in progress
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
