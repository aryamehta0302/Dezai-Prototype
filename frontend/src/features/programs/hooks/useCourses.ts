"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { DEFAULT_FILTERS, type CourseFilter } from "../types/course.types";
import { CourseCategory } from "@/shared/types/common.types";

export function useCourses(initialFilters?: Partial<CourseFilter>) {
  const { programs, isLoading, fetchPrograms } = useProgramsStore();

  const [filters, setFilters] = useState<CourseFilter>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const courses = useMemo(() => {
    let result = [...programs];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.faculty?.user?.name.toLowerCase().includes(q) ||
          c.institution?.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [programs, filters]);

  const updateFilter = useCallback(
    <K extends keyof CourseFilter>(key: K, value: CourseFilter[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters =
    filters.category !== "ALL" ||
    filters.tier !== "ALL" ||
    filters.university !== "ALL" ||
    filters.search !== "";

  const categories = [
    { value: "ALL", label: "All Categories", count: programs.length },
    { value: CourseCategory.AI, label: "Artificial Intelligence", count: programs.length },
  ];

  const tiers = [
    { value: "ALL", label: "All Tiers", description: "" },
    { value: "TIER_1", label: "Tier 1 — Foundational", description: "Dezai Core certification" },
    { value: "TIER_2", label: "Tier 2 — Academic", description: "University accredited" },
    { value: "TIER_3", label: "Tier 3 — Professional", description: "Industry verified" },
  ];

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
  };
}
