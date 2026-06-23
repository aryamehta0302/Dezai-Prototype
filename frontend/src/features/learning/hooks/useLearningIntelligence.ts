"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { learningApi } from "../services/learning-api.service";
import { useAuthStore } from "@/lib/stores/auth.store";
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

// ─── TTL Cache ────────────────────────────────────────────────────────
// Keeps fetched data in memory so re-mounting the dashboard doesn't fire
// 10+ API calls from scratch. Expires after CACHE_TTL_MS.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, ts: Date.now() });
}

function userKey(suffix: string): string {
  const uid = useAuthStore.getState().user?.id ?? "anon";
  return `${uid}:${suffix}`;
}

function useDataFetch<T>(
  fetcher: () => Promise<{ success: boolean; data: T }>,
  cacheKey: string,
): { data: T | null; loading: boolean; refetch: () => void } {
  const [data, setData] = useState<T | null>(() => getCached<T>(cacheKey));
  const [loading, setLoading] = useState(() => data === null);

  const fetch = useCallback(() => {
    // If fresh cache exists, skip the network call
    const cached = getCached<T>(cacheKey);
    if (cached !== null) {
      startTransition(() => setData(cached));
      startTransition(() => setLoading(false));
      return;
    }

    setLoading(true);
    fetcher()
      .then((res) => {
        if (res.success) {
          setCache(cacheKey, res.data);
          startTransition(() => setData(res.data));
        }
      })
      .catch(() => {})
      .finally(() => startTransition(() => setLoading(false)));
  }, [fetcher, cacheKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

function useDataFetchArray<T>(
  fetcher: () => Promise<{ success: boolean; data: T[] }>,
  cacheKey: string,
): { data: T[]; loading: boolean; refetch: () => void } {
  const [data, setData] = useState<T[]>(() => {
    const cached = getCached<T[]>(cacheKey);
    return cached ?? [];
  });
  const [loading, setLoading] = useState(() => getCached<T[]>(cacheKey) === null);

  const fetch = useCallback(() => {
    // If fresh cache exists, skip the network call
    const cached = getCached<T[]>(cacheKey);
    if (cached !== null) {
      startTransition(() => setData(cached));
      startTransition(() => setLoading(false));
      return;
    }

    setLoading(true);
    fetcher()
      .then((res) => {
        if (res.success) {
          setCache(cacheKey, res.data);
          startTransition(() => setData(res.data));
        }
      })
      .catch(() => {})
      .finally(() => startTransition(() => setLoading(false)));
  }, [fetcher, cacheKey]);

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
  const cacheKey = userKey(`activityTimeline:${limit}`);
  const { data, loading, refetch } = useDataFetchArray<ActivityEvent>(fetcher, cacheKey);
  return { data, loading, refetch };
}

export function useMilestones() {
  const { data, loading, refetch } = useDataFetchArray<Milestone>(
    useCallback(() => learningApi.getMilestones(), []),
    userKey('milestones'),
  );
  const unlocked = data.filter((m) => m.isUnlocked);
  const total = data.length;
  const progress = total > 0 ? Math.round((unlocked.length / total) * 100) : 0;
  return { data, unlocked, total, progress, loading, refetch };
}

export function useLearningPatterns() {
  const { data, loading, refetch } = useDataFetch<LearningPattern>(
    useCallback(() => learningApi.getLearningPatterns(), []),
    userKey('learningPatterns'),
  );
  return { data, loading, refetch };
}

export function useStreakInfo() {
  const { data, loading, refetch } = useDataFetch<StreakInfo>(
    useCallback(() => learningApi.getStreakInfo(), []),
    userKey('streakInfo'),
  );
  return { data, loading, refetch };
}

export function useInsights() {
  const { data, loading, refetch } = useDataFetchArray<StudentInsight>(
    useCallback(() => learningApi.getInsights(), []),
    userKey('insights'),
  );
  return { data, loading, refetch };
}

export function useRecommendations() {
  const { data, loading, refetch } = useDataFetchArray<LearningRecommendation>(
    useCallback(() => learningApi.getRecommendations(), []),
    userKey('recommendations'),
  );
  return { data, loading, refetch };
}

export function useWeakTopics() {
  const { data, loading, refetch } = useDataFetchArray<WeakTopic>(
    useCallback(() => learningApi.getWeakTopics(), []),
    userKey('weakTopics'),
  );
  return { data, loading, refetch };
}

export function useDifficultyAnalysis() {
  const { data, loading, refetch } = useDataFetchArray<DifficultyAnalysis>(
    useCallback(() => learningApi.getDifficultyAnalysis(), []),
    userKey('difficultyAnalysis'),
  );
  return { data, loading, refetch };
}

export function usePredictionRules() {
  const { data, loading, refetch } = useDataFetchArray<PredictionRule>(
    useCallback(() => learningApi.getPredictionRules(), []),
    userKey('predictionRules'),
  );
  return { data, loading, refetch };
}
