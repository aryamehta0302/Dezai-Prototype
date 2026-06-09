"use client";

import { useCallback, useMemo, useState } from "react";
import { courseService } from "../services/course.service";
import { DEFAULT_FILTERS, type CourseFilter } from "../types/course.types";

export function useCourses(initialFilters?: Partial<CourseFilter>) {
  const [filters, setFilters] = useState<CourseFilter>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const courses = useMemo(
    () => courseService.getCourses(filters),
    [filters]
  );

  const categories = useMemo(() => courseService.getCategories(), []);
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
  };
}
