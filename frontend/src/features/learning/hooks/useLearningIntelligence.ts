"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { learningApi } from "../services/learning-api.service";
import type {
  ActivityEvent,
  Milestone,
  LearningPattern,
  StreakInfo,
  StudentInsight,
  LearningRecommendation,
  WeakTopic,
  DifficultyAnalysis,
  PredictionRule,
} from "../types/learning-intelligence.types";

function useDataFetch<T>(
  fetcher: () => Promise<{ success: boolean; data: T }>,
): { data: T | null; loading: boolean; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    fetcher()
      .then((res) => {
        if (res.success) {
          startTransition(() => setData(res.data));
        }
      })
      .catch(() => {})
      .finally(() => startTransition(() => setLoading(false)));
  }, [fetcher]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

function useDataFetchArray<T>(
  fetcher: () => Promise<{ success: boolean; data: T[] }>,
): { data: T[]; loading: boolean; refetch: () => void } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    fetcher()
      .then((res) => {
        if (res.success) {
          startTransition(() => setData(res.data));
        }
      })
      .catch(() => {})
      .finally(() => startTransition(() => setLoading(false)));
  }, [fetcher]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useActivityTimeline(limit = 20) {
  const fetcher = useCallback(
    () => learningApi.getActivityTimeline({ limit }),
    [limit],
  );
  const { data, loading, refetch } = useDataFetchArray<ActivityEvent>(fetcher);
  return { data, loading, refetch };
}

export function useMilestones() {
  const { data, loading, refetch } = useDataFetchArray<Milestone>(
    useCallback(() => learningApi.getMilestones(), []),
  );
  const unlocked = data.filter((m) => m.isUnlocked);
  const total = data.length;
  const progress = total > 0 ? Math.round((unlocked.length / total) * 100) : 0;
  return { data, unlocked, total, progress, loading, refetch };
}

export function useLearningPatterns() {
  const { data, loading, refetch } = useDataFetch<LearningPattern>(
    useCallback(() => learningApi.getLearningPatterns(), []),
  );
  return { data, loading, refetch };
}

export function useStreakInfo() {
  const { data, loading, refetch } = useDataFetch<StreakInfo>(
    useCallback(() => learningApi.getStreakInfo(), []),
  );
  return { data, loading, refetch };
}

export function useInsights() {
  const { data, loading, refetch } = useDataFetchArray<StudentInsight>(
    useCallback(() => learningApi.getInsights(), []),
  );
  return { data, loading, refetch };
}

export function useRecommendations() {
  const { data, loading, refetch } = useDataFetchArray<LearningRecommendation>(
    useCallback(() => learningApi.getRecommendations(), []),
  );
  return { data, loading, refetch };
}

export function useWeakTopics() {
  const { data, loading, refetch } = useDataFetchArray<WeakTopic>(
    useCallback(() => learningApi.getWeakTopics(), []),
  );
  return { data, loading, refetch };
}

export function useDifficultyAnalysis() {
  const { data, loading, refetch } = useDataFetchArray<DifficultyAnalysis>(
    useCallback(() => learningApi.getDifficultyAnalysis(), []),
  );
  return { data, loading, refetch };
}

export function usePredictionRules() {
  const { data, loading, refetch } = useDataFetchArray<PredictionRule>(
    useCallback(() => learningApi.getPredictionRules(), []),
  );
  return { data, loading, refetch };
}
