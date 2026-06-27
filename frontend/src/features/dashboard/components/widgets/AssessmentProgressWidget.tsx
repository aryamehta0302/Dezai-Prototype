"use client";

import { Layers, ChevronDown, ChevronRight } from "lucide-react";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { MilestoneCard } from "@/features/learning/components/milestone-card";
import { useDashboardStore } from "../../store/dashboard.store";
import type { Milestone } from "@/features/learning/types/learning-intelligence.types";

interface AssessmentProgressWidgetProps {
  milestones: Milestone[];
  unlockedMilestones: Milestone[];
  totalCount: number;
  isLoading: boolean;
}

export function AssessmentProgressWidget({
  milestones,
  unlockedMilestones,
  totalCount,
  isLoading,
}: AssessmentProgressWidgetProps) {
  const { showAllMilestones, toggleMilestones } = useDashboardStore();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Milestones
        </h2>
        {!isLoading && totalCount > 0 && (
          <span className="text-xs text-secondary">
            {unlockedMilestones.length} / {totalCount} unlocked
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : milestones.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(showAllMilestones
              ? milestones
              : milestones.slice(0, 4)
            ).map((ms) => (
              <MilestoneCard key={ms.id} milestone={ms} />
            ))}
          </div>
          {milestones.length > 4 && (
            <button
              onClick={toggleMilestones}
              className="flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
            >
              {showAllMilestones ? (
                <>
                  Show less <ChevronDown className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show all ({milestones.length}){" "}
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </>
      ) : null}
    </section>
  );
}
