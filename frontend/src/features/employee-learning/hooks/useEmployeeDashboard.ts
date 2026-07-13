"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import type { DashboardStats } from "../types/employee-learning.types";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

export function useEmployeeDashboard() {
  const [data, setData] = useState<DashboardStats | null>(() => getCached<DashboardStats>("dashboard"));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const cached = getCached<DashboardStats>("dashboard");
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await employeeLearningApi.getDashboard();
      const stats = res as unknown as DashboardStats;
      setCache("dashboard", stats);
      setData(stats);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const refetch = useCallback(() => {
    cache.delete("dashboard");
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
}
