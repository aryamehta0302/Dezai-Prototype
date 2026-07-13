"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import type { ActivityEvent } from "../types/employee-learning.types";

export function useEmployeeTimeline(limit = 20) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const res = await employeeLearningApi.getTimeline(limit, offset);
      const data = res as unknown as { events: ActivityEvent[]; total: number; hasMore: boolean };
      if (offset === 0) {
        setEvents(data.events);
      } else {
        setEvents((prev) => [...prev, ...data.events]);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load timeline");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetch(events.length);
    }
  }, [fetch, loading, hasMore, events.length]);

  return { events, loading, error, hasMore, total, loadMore, refetch: () => fetch(0) };
}
