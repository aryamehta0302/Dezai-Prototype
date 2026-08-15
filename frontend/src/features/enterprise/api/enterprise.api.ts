import { apiClient } from "@/core/api/client";
import { ApiResponse } from "@/shared/types/common.types";

export interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: string | null;
  size: string | null;
  createdAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string | null;
  title: string | null;
  employmentStatus: "INVITED" | "ACTIVE" | "SUSPENDED" | "TERMINATED";
  invitedAt: string | null;
  joinedAt: string | null;
  user?: {
    name: string;
    email: string;
    avatar: string | null;
  };
  department?: Department;
}

export interface OrgAdmin {
  id: string;
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MANAGER";
  assignedAt: string;
  user?: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

export const enterpriseApi = {
  // Organizations
  createOrganization: async (data: { name: string; industry?: string; size?: string }) => {
    return apiClient.post<Organization>("/organizations", data);
  },

  getOrganizations: async () => {
    // Note: The backend typically returns raw array or ApiResponse depending on controller setup.
    // For now we assume it returns the raw array based on the backend service code.
    return apiClient.get<Organization[]>("/organizations");
  },
  
  getOrganizationById: async (id: string) => {
    return apiClient.get<Organization>(`/organizations/${id}`);
  },

  updateOrganization: async (id: string, data: Partial<Organization>) => {
    return apiClient.put<Organization>(`/organizations/${id}`, data);
  },

  deleteOrganization: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/organizations/${id}`);
  },

  // Employees
  getEmployees: async (organizationId: string) => {
    return apiClient.get<Employee[]>(`/organizations/${organizationId}/employees`);
  },

  inviteEmployee: async (organizationId: string, data: { userId: string, departmentId?: string, title?: string }) => {
    return apiClient.post<Employee>(`/organizations/${organizationId}/employees/invite`, data);
  },

  acceptInvitation: async (organizationId: string, employeeId: string) => {
    return apiClient.post<Employee>(`/organizations/${organizationId}/employees/${employeeId}/accept-invitation`, {});
  },

  removeEmployee: async (organizationId: string, employeeId: string) => {
    return apiClient.delete<Employee>(`/organizations/${organizationId}/employees/${employeeId}`);
  },

  // Departments
  getDepartments: async (organizationId: string) => {
    return apiClient.get<Department[]>(`/organizations/${organizationId}/departments`);
  },

  createDepartment: async (organizationId: string, data: { name: string, description?: string }) => {
    return apiClient.post<Department>(`/organizations/${organizationId}/departments`, data);
  },

  updateDepartment: async (organizationId: string, departmentId: string, data: { name?: string, description?: string }) => {
    return apiClient.put<Department>(`/organizations/${organizationId}/departments/${departmentId}`, data);
  },

  deleteDepartment: async (organizationId: string, departmentId: string) => {
    return apiClient.delete<{ success: boolean }>(`/organizations/${organizationId}/departments/${departmentId}`);
  },

  // Org Admins
  getOrgAdmins: async (organizationId: string) => {
    return apiClient.get<OrgAdmin[]>(`/organizations/${organizationId}/admins`);
  },

  assignOrgAdmin: async (organizationId: string, data: { userId: string, role: string }) => {
    return apiClient.post<OrgAdmin>(`/organizations/${organizationId}/admins`, data);
  },

  removeOrgAdmin: async (organizationId: string, adminId: string) => {
    return apiClient.delete<{ success: boolean }>(`/organizations/${organizationId}/admins/${adminId}`);
  },
};
