"use client";

import { Skeleton } from "@/shared/ui/skeleton";

export function AssessmentPlayerSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6 space-y-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>

      <Skeleton className="h-48 w-full rounded-2xl" />

      <Skeleton className="h-40 w-full rounded-2xl" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}

export function AssessmentResultSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <Skeleton className="h-64 w-full rounded-3xl" />

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Skeleton className="h-14 w-48 rounded-xl" />
        <Skeleton className="h-14 w-48 rounded-xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function AttemptHistorySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <div className="border border-border/40 rounded-xl overflow-hidden">
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
