"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import type { EmployeeBookmark } from "../types/employee-learning.types";

export function useEmployeeBookmarks() {
  const [bookmarks, setBookmarks] = useState<EmployeeBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeLearningApi.getBookmarks();
      setBookmarks((res as unknown as { bookmarks: EmployeeBookmark[] }).bookmarks);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const toggle = useCallback(async (assessmentId: string) => {
    const res = await employeeLearningApi.toggleBookmark(assessmentId);
    const data = res as unknown as { bookmarked: boolean };
    if (data.bookmarked) {
      fetchBookmarks();
    } else {
      setBookmarks((prev) => prev.filter((b) => b.assessmentId !== assessmentId));
    }
    return data.bookmarked;
  }, [fetchBookmarks]);

  return { bookmarks, loading, error, toggle, refetch: fetchBookmarks };
}
