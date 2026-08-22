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
  const [categories, setCategories] = useState<
    { value: string; label: string; count: number }[]
  >([
    { value: "ALL", label: "All Domains", count: totalResults },
    { value: "AI", label: "Artificial Intelligence", count: 0 },
  ]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await courseService.getCategories();

        if (response?.data && response.data.length > 0) {
          const mappedCategories = response.data.map((category) => ({
            value: category.value ?? category.slug ?? category.name,
            label: category.label ?? category.name,
            count: category.count ?? 0,
          }));

          setCategories([
            { value: "ALL", label: "All Domains", count: totalResults },
            ...mappedCategories,
          ]);
        }
      } catch {
        setCategories([
          { value: "ALL", label: "All Domains", count: totalResults },
          { value: "AI", label: "Artificial Intelligence", count: 0 },
        ]);
      }
    };

    loadCategories();
  }, [totalResults]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange("search", debouncedSearch);
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  const handleReset = () => {
    setSearchInput("");
    onReset();
  };

  const selectedCategory =
    categories.find((category) => category.value === filters.category) ?? categories[0];

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search courses"
            className="pl-9 pr-9"
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
          <Select
            value={selectedCategory?.value ?? "ALL"}
            onValueChange={(value) => onFilterChange("category", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label} {category.count > 0 ? `(${category.count})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" variant="outline" onClick={handleReset} disabled={!hasActiveFilters}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
