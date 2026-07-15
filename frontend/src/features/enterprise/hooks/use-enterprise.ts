import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enterpriseApi } from "../api/enterprise.api";
import { toast } from "sonner";

export const ENTERPRISE_KEYS = {
  allOrganizations: ["organizations"] as const,
  organization: (id: string) => ["organization", id] as const,
  employees: (orgId: string) => ["organization", orgId, "employees"] as const,
  departments: (orgId: string) => ["organization", orgId, "departments"] as const,
  admins: (orgId: string) => ["organization", orgId, "admins"] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: ENTERPRISE_KEYS.allOrganizations,
    queryFn: () => enterpriseApi.getOrganizations(),
  });
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: ENTERPRISE_KEYS.organization(id!),
    queryFn: () => enterpriseApi.getOrganizationById(id!),
    enabled: !!id,
  });
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof enterpriseApi.updateOrganization>[1]) => 
      enterpriseApi.updateOrganization(id, data),
    onSuccess: () => {
      toast.success("Organization updated successfully");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.organization(id) });
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.allOrganizations });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update organization");
    }
  });
}

export function useEmployees(orgId: string | undefined) {
  return useQuery({
    queryKey: ENTERPRISE_KEYS.employees(orgId!),
    queryFn: () => enterpriseApi.getEmployees(orgId!),
    enabled: !!orgId,
  });
}

export function useDepartments(orgId: string | undefined) {
  return useQuery({
    queryKey: ENTERPRISE_KEYS.departments(orgId!),
    queryFn: () => enterpriseApi.getDepartments(orgId!),
    enabled: !!orgId,
  });
}

export function useCreateDepartment(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof enterpriseApi.createDepartment>[1]) => 
      enterpriseApi.createDepartment(orgId, data),
    onSuccess: () => {
      toast.success("Department created successfully");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.departments(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create department");
    }
  });
}

export function useUpdateDepartment(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ departmentId, data }: { departmentId: string, data: Parameters<typeof enterpriseApi.updateDepartment>[2] }) => 
      enterpriseApi.updateDepartment(orgId, departmentId, data),
    onSuccess: () => {
      toast.success("Department updated successfully");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.departments(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update department");
    }
  });
}

export function useDeleteDepartment(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentId: string) => enterpriseApi.deleteDepartment(orgId, departmentId),
    onSuccess: () => {
      toast.success("Department deleted successfully");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.departments(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete department");
    }
  });
}

export function useInviteEmployee(orgId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { userId: string, departmentId?: string, title?: string }) => 
      enterpriseApi.inviteEmployee(orgId, data),
    onSuccess: () => {
      toast.success("Employee invited successfully!");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.employees(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to invite employee");
    }
  });
}

export function useAcceptInvitation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => enterpriseApi.acceptInvitation(orgId, employeeId),
    onSuccess: () => {
      toast.success("Invitation accepted! Employee is now active.");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.employees(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept invitation");
    }
  });
}

export function useRemoveEmployee(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => enterpriseApi.removeEmployee(orgId, employeeId),
    onSuccess: () => {
      toast.success("Employee removed from the organization.");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.employees(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove employee");
    }
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; industry?: string; size?: string }) =>
      enterpriseApi.createOrganization(data),
    onSuccess: () => {
      toast.success("Organization created successfully!");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.allOrganizations });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create organization");
    }
  });
}

export function useOrgAdmins(orgId: string | undefined) {
  return useQuery({
    queryKey: ENTERPRISE_KEYS.admins(orgId!),
    queryFn: () => enterpriseApi.getOrgAdmins(orgId!),
    enabled: !!orgId,
  });
}

export function useAssignOrgAdmin(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof enterpriseApi.assignOrgAdmin>[1]) => 
      enterpriseApi.assignOrgAdmin(orgId, data),
    onSuccess: () => {
      toast.success("Admin role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.admins(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign admin");
    }
  });
}

export function useRemoveOrgAdmin(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => enterpriseApi.removeOrgAdmin(orgId, adminId),
    onSuccess: () => {
      toast.success("Admin role removed");
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.admins(orgId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove admin");
    }
  });
}

/**
 * A composite hook to load all necessary stats for the enterprise dashboard.
 */
export function useOrganizationStats(orgId: string | undefined) {
  const { data: org, isLoading: isLoadingOrg } = useOrganization(orgId);
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees(orgId);
  const { data: departments, isLoading: isLoadingDepartments } = useDepartments(orgId);

  const isLoading = isLoadingOrg || isLoadingEmployees || isLoadingDepartments;

  return {
    org,
    employees,
    departments,
    isLoading,
    stats: {
      totalEmployees: employees?.length || 0,
      activeEmployees: employees?.filter(e => e.employmentStatus === 'ACTIVE').length || 0,
      totalDepartments: departments?.length || 0,
    }
  };
}
