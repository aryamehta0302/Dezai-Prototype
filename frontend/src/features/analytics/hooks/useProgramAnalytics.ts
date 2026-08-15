"use client";

/**
 * @module features/analytics/hooks/useProgramAnalytics
 *
 * Hook for faculty-facing chart data: module completion stats for a given program.
 * Calls GET /api/analytics/programs/:id/modules/stats
 *
 * Usage:
 *   const { moduleStats, isLoading } = useProgramAnalytics(selectedProgramId);
 */

import { useState, useEffect } from "react";
import { analyticsService } from "../services/analytics.service";
import type { ModuleCompletionStat } from "../types/analytics.types";

interface UseProgramAnalyticsResult {
  moduleStats: ModuleCompletionStat[];
  isLoading: boolean;
  error: string | null;
}

export function useProgramAnalytics(programId: string): UseProgramAnalyticsResult {
  const [moduleStats, setModuleStats] = useState<ModuleCompletionStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId) {
      setModuleStats([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const stats = await analyticsService.getModuleStats(programId);
        if (!cancelled) {
          setModuleStats(stats);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load module analytics");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [programId]);

  return { moduleStats, isLoading, error };
}
