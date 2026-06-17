"use client";

import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { courseService } from "../services/course.service";
import type { CourseFilter } from "../types/course.types";
import { useEffect, useMemo, useState } from "react";

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

  const categories = useMemo(() => [
    { value: "ALL", label: "All Categories", count: totalResults },
    { value: "AI", label: "Artificial Intelligence", count: totalResults },
    { value: "COMMERCE", label: "Commerce & Business", count: 0 },
    { value: "DESIGN", label: "Design", count: 0 },
  ], [totalResults]);

  const tiers = useMemo(() => courseService.getTiers(), []);

  useEffect(() => {
    onFilterChange("search", debouncedSearch);
  }, [debouncedSearch, onFilterChange]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search courses..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.category as string}
          onValueChange={(v) => onFilterChange("category", (v ?? "ALL") as CourseFilter["category"])}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label} ({cat.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.tier as string}
          onValueChange={(v) => onFilterChange("tier", (v ?? "ALL") as CourseFilter["tier"])}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            {tiers.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 text-muted">
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}

        <span className="ml-auto text-sm text-muted">
          {totalResults} course{totalResults !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
