"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import { ComplianceAssessmentPlayer } from "../components/ComplianceAssessmentPlayer";
import type { AssessmentQuestion, AttemptResult } from "../types/employee-learning.types";

export default function ComplianceAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(900);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await employeeLearningApi.startAttempt(assessmentId);
      const data = res as unknown as {
        attemptId: string;
        assessmentTitle: string;
        questions: AssessmentQuestion[];
        timeLimit: number;
        timeLimitEnabled: boolean;
      };
      setAttemptId(data.attemptId);
      setAssessmentTitle(data.assessmentTitle);
      setQuestions(data.questions);
      setTimeLimit(data.timeLimit);
      setTimeLimitEnabled(data.timeLimitEnabled);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start assessment");
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => { handleStart(); }, [handleStart]);

  const handleSubmit = useCallback(async (answers: Record<string, string>, timeTakenSeconds: number) => {
    const res = await employeeLearningApi.submitAttempt(assessmentId, answers, timeTakenSeconds);
    return res as unknown as AttemptResult;
  }, [assessmentId]);

  const handleCancel = useCallback(() => {
    router.push("/learning");
  }, [router]);

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Loading assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4 text-center py-20">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <ComplianceAssessmentPlayer
      questions={questions}
      assessmentTitle={assessmentTitle}
      timeLimit={timeLimit}
      timeLimitEnabled={timeLimitEnabled}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
