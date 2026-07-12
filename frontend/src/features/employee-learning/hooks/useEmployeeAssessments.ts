"use client";

import { useState, useCallback } from "react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import type { AssessmentWithStatus, AssessmentQuestion, AttemptResult } from "../types/employee-learning.types";

export function useEmployeeAssessments() {
  const [assessments, setAssessments] = useState<AssessmentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeLearningApi.listAssessments();
      setAssessments((res as unknown as { assessments: AssessmentWithStatus[] }).assessments);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  }, []);

  const startAttempt = useCallback(async (assessmentId: string) => {
    const res = await employeeLearningApi.startAttempt(assessmentId);
    return res as unknown as {
      attemptId: string;
      assessmentTitle: string;
      complianceTrack: string;
      timeLimit: number;
      timeLimitEnabled: boolean;
      questions: AssessmentQuestion[];
      startedAt: string;
    };
  }, []);

  const submitAttempt = useCallback(async (assessmentId: string, answers: Record<string, string>, timeTakenSeconds?: number) => {
    const res = await employeeLearningApi.submitAttempt(assessmentId, answers, timeTakenSeconds);
    return res as unknown as AttemptResult;
  }, []);

  return { assessments, loading, error, refetch: fetch, startAttempt, submitAttempt };
}
