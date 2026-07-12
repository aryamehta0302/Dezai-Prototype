"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import type { TrackProgress } from "../types/employee-learning.types";

const CACHE_KEY = "employee-progress";
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiry) { cache.delete(key); return null; }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

export function useEmployeeProgress() {
  const [tracks, setTracks] = useState<TrackProgress[]>(() => getCached<TrackProgress[]>(CACHE_KEY) || []);
  const [loading, setLoading] = useState(tracks.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const cached = getCached<TrackProgress[]>(CACHE_KEY);
    if (cached) { setTracks(cached); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await employeeLearningApi.getProgress();
      const data = (res as unknown as { tracks: TrackProgress[] }).tracks;
      setCache(CACHE_KEY, data);
      setTracks(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  const refetch = useCallback(() => { cache.delete(CACHE_KEY); fetch(); }, [fetch]);

  return { tracks, loading, error, refetch };
}
