import { apiClient } from "@/core/api/client";
import {
  PlatformOverviewMetrics,
  PlatformUser,
  PlatformInstitution,
  SystemHealthMetrics,
} from "../types/platform-admin.types";

export const platformAdminService = {
  getOverview: () => {
    return apiClient.get<PlatformOverviewMetrics>("/platform-admin/analytics/overview");
  },

  getGrowth: (period: string = "30d") => {
    return apiClient.get<any>("/platform-admin/analytics/growth", { params: { period } });
  },

  getAllUsers: (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    return apiClient.get<{ items: PlatformUser[]; total: number }>("/platform-admin/users", { params });
  },

  getUserById: (id: string) => {
    return apiClient.get<any>(`/platform-admin/users/${id}`);
  },

  suspendUser: (id: string, reason?: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/platform-admin/users/${id}/suspend`, { reason });
  },

  reactivateUser: (id: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/platform-admin/users/${id}/reactivate`);
  },

  assignRole: (id: string, role: string, institutionId?: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/platform-admin/users/${id}/assign-role`, {
      role,
      institutionId,
    });
  },

  revokeRole: (id: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/platform-admin/users/${id}/revoke-role`);
  },

  getAllInstitutions: (params?: { status?: string; search?: string }) => {
    return apiClient.get<PlatformInstitution[]>("/platform-admin/institutions", { params });
  },

  approveInstitution: (id: string) => {
    return apiClient.post<PlatformInstitution>(`/platform-admin/institutions/${id}/approve`);
  },

  rejectInstitution: (id: string, reason?: string) => {
    return apiClient.post<PlatformInstitution>(`/platform-admin/institutions/${id}/reject`, { reason });
  },

  suspendInstitution: (id: string, reason?: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/platform-admin/institutions/${id}/suspend`, { reason });
  },

  reactivateInstitution: (id: string) => {
    return apiClient.post<{ success: boolean; message: string }>(`/platform-admin/institutions/${id}/reactivate`);
  },

  getAuditLogs: (params?: { userId?: string; action?: string; search?: string; page?: number; limit?: number }) => {
    return apiClient.get<{ items: any[]; total: number }>("/platform-admin/audit-logs", { params });
  },

  getSystemHealth: () => {
    return apiClient.get<SystemHealthMetrics>("/platform-admin/system-health");
  },

  getSettings: () => {
    return apiClient.get<any>("/platform-admin/settings");
  },

  updateSettings: (settings: Record<string, any>) => {
    return apiClient.patch<any>("/platform-admin/settings", { settings });
  },
};
