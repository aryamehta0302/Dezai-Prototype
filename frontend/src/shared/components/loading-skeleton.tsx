import { cn } from "@/shared/utils/cn";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "skeleton-shimmer rounded-lg",
            className
          )}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-elevation p-6 space-y-4">
      <LoadingSkeleton className="h-4 w-2/3" />
      <LoadingSkeleton className="h-8 w-1/3" />
      <LoadingSkeleton className="h-3 w-1/2" />
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="card-elevation flex flex-col overflow-hidden">
      <LoadingSkeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-full" />
        <LoadingSkeleton className="h-3 w-1/2" />
        <div className="pt-2 space-y-2">
          <LoadingSkeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between pt-2">
            <LoadingSkeleton className="h-5 w-12" />
            <LoadingSkeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-8 w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
      </div>
      <TableSkeleton />
    </div>
  );
}
