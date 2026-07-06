import { LoadingSkeleton } from '@/shared/components/loading-skeleton';

export function AchievementsPageSkeleton() {
  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <LoadingSkeleton className="h-16 w-16 rounded-2xl mx-auto" />
        <LoadingSkeleton className="h-10 w-64 mx-auto" />
        <LoadingSkeleton className="h-5 w-80 mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <LoadingSkeleton className="h-52 rounded-xl" />
          <LoadingSkeleton className="h-64 rounded-xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <LoadingSkeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
