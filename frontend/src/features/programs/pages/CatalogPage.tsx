"use client";

import { PageContainer } from "@/shared/components/page-container";
import { CourseCard } from "../components/course-card";
import { CourseFilters } from "../components/course-filters";
import { EmptyState } from "@/shared/components/empty-state";
import { CourseCardSkeleton } from "@/shared/components/loading-skeleton";
import { useCourses } from "../hooks/useCourses";
import { SearchX, Loader2 } from "lucide-react";

export function CatalogPage() {
  const {
    courses,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    totalResults,
    isLoading,
  } = useCourses();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border-light">
        <PageContainer className="py-8">
          <h1 className="text-2xl font-bold text-on-surface">Course Catalog</h1>
          <p className="text-muted mt-1">
            Explore university-grade courses across multiple disciplines
          </p>
        </PageContainer>
      </div>

      <PageContainer className="py-8 space-y-6">
        <CourseFilters
          filters={filters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          totalResults={totalResults}
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading courses...
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No courses found"
            description="Try adjusting your filters or search terms."
          />
        )}
      </PageContainer>
    </div>
  );
}
