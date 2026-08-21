"use client";

import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { courseService } from "../services/course.service";
import type { CourseFilter } from "../types/course.types";
import { useEffect, useState } from "react";

interface CourseFiltersProps {
  filters: CourseFilter;
  onFilterChange: <K extends keyof CourseFilter>(key: K, value: CourseFilter[K]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  totalResults: number;
}

export function CourseFilters({
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  totalResults,
}: CourseFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Source of truth for filter values lives on the backend via courseService.
  // Fallback list keeps the UI usable if the request fails or returns empty.
  const [categories, setCategories] = useState
    { value: string; label: string; count: number }[]
  >([
    { value: "ALL", label: "All Domains", count: totalResults },
    { value: "AI", label: "Artificial Intelligence",