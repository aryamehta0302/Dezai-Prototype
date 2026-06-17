"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { courseService } from "../services/course.service";
import { DEFAULT_FILTERS, type CourseFilter } from "../types/course.types";
import type { ApiProgram } from "../types/program.types";

export function useCourses(initialFilters?: Partial<CourseFilter>) {
  const [courses, setCourses] = useState<ApiProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CourseFilter>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    courseService.getCourses(filters).then((result) => {
      if (!cancelled) {
        setCourses(result);
        setIsLoading(false);
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [filters]);

  const categories = useMemo(() => [
    { value: "ALL", label: "All Categories", count: courses.length },
    { value: "AI", label: "Artificial Intelligence", count: courses.length },
    { value: "COMMERCE", label: "Commerce & Business", count: 0 },
    { value: "DESIGN", label: "Design", count: 0 },
  ], [courses.length]);

  const tiers = useMemo(() => courseService.getTiers(), []);

  const updateFilter = useCallback(<K extends keyof CourseFilter>(
    key: K,
    value: CourseFilter[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters =
    filters.category !== "ALL" ||
    filters.tier !== "ALL" ||
    filters.university !== "ALL" ||
    filters.search !== "";

  return {
    courses,
    filters,
    categories,
    tiers,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    totalResults: courses.length,
    isLoading,
    error,
  };
}
