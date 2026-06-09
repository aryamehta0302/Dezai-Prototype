"use client";

import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { mockUniversities } from "@/lib/mock-data/universities";
import type { CourseFilter } from "../types/course.types";
import { courseService } from "../services/course.service";
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
  const categories = courseService.getCategories();
  const tiers = courseService.getTiers();

  useEffect(() => {
    onFilterChange("search", debouncedSearch);
  }, [debouncedSearch, onFilterChange]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search courses, instructors, universities..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
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

        <Select
          value={filters.university}
          onValueChange={(v) => onFilterChange("university", v ?? "ALL")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="University" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Universities</SelectItem>
            {mockUniversities.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.shortName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(v) => onFilterChange("sortBy", (v ?? "popular") as CourseFilter["sortBy"])}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price-low">Price: Low→High</SelectItem>
            <SelectItem value="price-high">Price: High→Low</SelectItem>
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
