"use client";

/**
 * @module features/analytics/hooks/useEnterpriseAnalytics
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only.
 */

import { useState, useEffect, useCallback } from "react";
import { enterpriseAnalyticsService } from "../services/enterprise-analytics.service";
import type {
  EnterpriseOverview,
  EnterpriseTrackStat,
  EnterpriseDepartmentStat,
  EnterpriseEmployeeList,
  EnterpriseActivityEntry,
} from "../types/enterprise-analytics.types";

interface UseEnterpriseAnalyticsResult {
  overview: EnterpriseOverview | null;
  tracks: EnterpriseTrackStat[];
  departments: EnterpriseDepartmentStat[];
  employees: EnterpriseEmployeeList | null;
  activity: EnterpriseActivityEntry[];
  isLoading: boolean;
  error: string | null;
  fetchEmployeePage: (page: number) => Promise<void>;
}

export function useEnterpriseAnalytics(organizationId?: string): UseEnterpriseAnalyticsResult {
  const [overview, setOverview] = useState<EnterpriseOverview | null>(null);
  const [tracks, setTracks] = useState<EnterpriseTrackStat[]>([]);
  const [departments, setDepartments] = useState<EnterpriseDepartmentStat[]>([]);
  const [employees, setEmployees] = useState<EnterpriseEmployeeList | null>(null);
  const [activity, setActivity] = useState<EnterpriseActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [overviewData, tracksData, depsData, activityData, employeesData] =
          await Promise.all([
            enterpriseAnalyticsService.getOverview(organizationId),
            enterpriseAnalyticsService.getTrackBreakdown(organizationId),
            enterpriseAnalyticsService.getDepartmentBreakdown(organizationId),
            enterpriseAnalyticsService.getActivityFeed(organizationId),
            enterpriseAnalyticsService.getEmployeeCompliance(1, 20, organizationId),
          ]);

        if (cancelled) return;
        setOverview(overviewData);
        setTracks(tracksData);
        setDepartments(depsData);
        setActivity(activityData);
        setEmployees(employeesData);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load enterprise analytics");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [organizationId]);

  const fetchEmployeePage = useCallback(
    async (page: number) => {
      try {
        const result = await enterpriseAnalyticsService.getEmployeeCompliance(page, 20, organizationId);
        setEmployees(result);
      } catch { /* non-blocking */ }
    },
    [organizationId],
  );

  return { overview, tracks, departments, employees, activity, isLoading, error, fetchEmployeePage };
}
