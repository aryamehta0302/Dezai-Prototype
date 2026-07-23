import { apiClient } from "@/core/api/client";
import { Department, DepartmentStatistics } from "../types/department.types";

export const departmentService = {
  getDepartments: (institutionId?: string) => {
    return apiClient.get<Department[]>("/departments", {
      params: institutionId ? { institutionId } : undefined,
    });
  },

  getDepartmentById: (id: string) => {
    return apiClient.get<Department>(`/departments/${id}`);
  },

  createDepartment: (data: { name: string; code?: string; description?: string; headFacultyId?: string; institutionId?: string }) => {
    return apiClient.post<Department>("/departments", data);
  },

  updateDepartment: (id: string, institutionId: string, data: { name?: string; code?: string; description?: string; headFacultyId?: string }) => {
    return apiClient.patch<Department>(`/departments/${id}`, data, {
      params: { institutionId },
    });
  },

  deleteDepartment: (id: string, institutionId: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/departments/${id}`, {
      params: { institutionId },
    });
  },

  assignHead: (id: string, institutionId: string, facultyId: string) => {
    return apiClient.post<Department>(`/departments/${id}/head`, { facultyId }, {
      params: { institutionId },
    });
  },

  getDepartmentStatistics: (id: string, institutionId: string) => {
    return apiClient.get<DepartmentStatistics>(`/departments/${id}/statistics`, {
      params: { institutionId },
    });
  },
};
