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

  type Category = { value: string; label: string; count: number };
  const [categories, setCategories] = useState<Category[]>([
    { value: "ALL", label: "All Domains", count: totalResults },
    { value: "AI", label: "Artificial Intelligence", count: 0 },
    { value: "COMMERCE", label: "Commerce & Business", count: 0 },
    { value: "DESIGN", label: "Design", count: 0 },
  ]);

  useEffect(() => {
    let cancelled = false;
    courseService.getCategories().then((cats) => {
      if (cancelled || cats.length === 0) return;
      setCategories(cats);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tiers = courseService.getTiers();

  useEffect(() => {
    onFilterChange("search", debouncedSearch);
  }, [debouncedSearch, onFilterChange]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search courses"
            className="pl-9"
          />
          {searchInput && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Domain</label>
            <Select
              value={filters.category as string}
              onValueChange={(v) => onFilterChange("category", (v ?? "ALL") as CourseFilter["category"])}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: { value: string; label: string; count: number }) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} {cat.count > 0 ? `(${cat.count})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Tier</label>
            <Select
              value={filters.tier as string}
              onValueChange={(v) => onFilterChange("tier", (v ?? "ALL") as CourseFilter["tier"])}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 self-end">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}

          <span className="ml-auto self-end text-sm text-muted-foreground">
            {totalResults} course{totalResults !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}