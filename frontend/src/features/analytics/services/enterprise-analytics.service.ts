/**
 * @module features/analytics/services/enterprise-analytics.service
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only.
 */

import { apiClient } from "@/core/api/client";
import type {
  EnterpriseOverview,
  EnterpriseTrackStat,
  EnterpriseDepartmentStat,
  EnterpriseEmployeeList,
  EnterpriseActivityEntry,
} from "../types/enterprise-analytics.types";

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

const BASE = "/analytics/enterprise";

export const enterpriseAnalyticsService = {
  async getOverview(organizationId?: string): Promise<EnterpriseOverview | null> {
    try {
      const params = organizationId ? { organizationId } : undefined;
      const res = await apiClient.get<ApiWrapper<EnterpriseOverview>>(`${BASE}/overview`, { params });
      return res.success ? res.data : null;
    } catch { return null; }
  },

  async getTrackBreakdown(organizationId?: string): Promise<EnterpriseTrackStat[]> {
    try {
      const params = organizationId ? { organizationId } : undefined;
      const res = await apiClient.get<ApiWrapper<EnterpriseTrackStat[]>>(`${BASE}/tracks`, { params });
      return res.success ? res.data : [];
    } catch { return []; }
  },

  async getDepartmentBreakdown(organizationId?: string): Promise<EnterpriseDepartmentStat[]> {
    try {
      const params = organizationId ? { organizationId } : undefined;
      const res = await apiClient.get<ApiWrapper<EnterpriseDepartmentStat[]>>(`${BASE}/departments`, { params });
      return res.success ? res.data : [];
    } catch { return []; }
  },

  async getEmployeeCompliance(
    page = 1,
    limit = 20,
    organizationId?: string,
  ): Promise<EnterpriseEmployeeList | null> {
    try {
      const params: Record<string, string | number> = { page, limit };
      if (organizationId) params.organizationId = organizationId;
      const res = await apiClient.get<ApiWrapper<EnterpriseEmployeeList>>(`${BASE}/employees`, { params });
      return res.success ? res.data : null;
    } catch { return null; }
  },

  async getActivityFeed(organizationId?: string): Promise<EnterpriseActivityEntry[]> {
    try {
      const params = organizationId ? { organizationId } : undefined;
      const res = await apiClient.get<ApiWrapper<EnterpriseActivityEntry[]>>(`${BASE}/activity`, { params });
      return res.success ? res.data : [];
    } catch { return []; }
  },
};
