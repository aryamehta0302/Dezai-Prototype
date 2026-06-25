"use client";

import { useQuery } from "@tanstack/react-query";
import { assessmentAttemptService } from "../services/assessment-attempt.service";
import { AttemptHistoryItem, AttemptStatusResponse } from "../types/assessment.types";

const ASSESSMENT_KEYS = {
  all: () => ["assessments"] as const,
  history: (assessmentId: string) => ["assessments", "history", assessmentId] as const,
  attemptStatus: (assessmentId: string) => ["assessments", "attempt-status", assessmentId] as const,
};

export function useAttemptHistory(assessmentId: string, token?: string) {
  return useQuery({
    queryKey: ASSESSMENT_KEYS.history(assessmentId),
    queryFn: async () => {
      const res = await assessmentAttemptService.getAttemptHistory(assessmentId, token!);
      return res.attempts as AttemptHistoryItem[];
    },
    enabled: !!token && !!assessmentId,
    staleTime: 0,
  });
}

export function useAttemptStatus(assessmentId: string, token?: string) {
  return useQuery({
    queryKey: ASSESSMENT_KEYS.attemptStatus(assessmentId),
    queryFn: () => assessmentAttemptService.getAttemptStatus(assessmentId, token!),
    enabled: !!token && !!assessmentId,
    staleTime: 0,
  });
}
