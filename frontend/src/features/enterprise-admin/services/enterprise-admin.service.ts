import { apiClient } from '@/core/api/client';
import type {
  Organization,
  Department,
  Employee,
  PaginatedEmployees,
  DepartmentStats,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeSearchParams,
  UpdateOrgSettingsInput,
} from '../types/enterprise-admin.types';

const BASE = '/enterprise-admin';

export const enterpriseAdminService = {
  // ─────────────────── ORG SETTINGS ───────────────────

  /** Fetch organization profile and settings. */
  getOrganization: async (organizationId?: string): Promise<Organization> => {
    const params = organizationId ? { organizationId } : undefined;
    const res = await apiClient.get<{ success: boolean; organization: Organization }>(
      `${BASE}/org`,
      { params }
    );
    return res.organization;
  },

  /** Update org-level settings (name, logo, industry, size, billingEmail). */
  updateOrgSettings: async (
    data: UpdateOrgSettingsInput,
    organizationId?: string,
  ): Promise<Organization> => {
    const params = organizationId ? { organizationId } : undefined;
    const res = await apiClient.patch<{ success: boolean; organization: Organization }>(
      `${BASE}/org/settings`,
      data,
      { params }
    );
    return res.organization;
  },

  // ─────────────────── DEPARTMENTS ───────────────────

  /** List all departments in an organization with manager info and headcount. */
  getDepartments: async (organizationId?: string): Promise<Department[]> => {
    const params = organizationId ? { organizationId } : undefined;
    const res = await apiClient.get<{ success: boolean; departments: Department[] }>(
      `${BASE}/departments`,
      { params }
    );
    return res.departments;
  },

  /** Get a single department by ID. */
  getDepartment: async (id: string): Promise<Department> => {
    const res = await apiClient.get<{ success: boolean; department: Department }>(
      `${BASE}/departments/${id}`,
    );
    return res.department;
  },

  /** Create a new department. */
  createDepartment: async (data: CreateDepartmentInput): Promise<Department> => {
    const res = await apiClient.post<{ success: boolean; department: Department }>(
      `${BASE}/departments`,
      data,
    );
    return res.department;
  },

  /** Update a department's name or description. */
  updateDepartment: async (id: string, data: UpdateDepartmentInput): Promise<Department> => {
    const res = await apiClient.patch<{ success: boolean; department: Department }>(
      `${BASE}/departments/${id}`,
      data,
    );
    return res.department;
  },

  /** Delete a department. Employees will become department-less (SetNull). */
  deleteDepartment: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/departments/${id}`);
  },

  /** Get headcount stats and manager assignment summary per department. */
  getDepartmentStats: async (organizationId?: string): Promise<DepartmentStats> => {
    const params = organizationId ? { organizationId } : undefined;
    const res = await apiClient.get<{ success: boolean } & DepartmentStats>(
      `${BASE}/departments-stats`,
      { params }
    );
    return { departments: res.departments, summary: res.summary };
  },

  // ─────────────────── EMPLOYEES ───────────────────

  /** List all employees in an organization. */
  getEmployees: async (organizationId?: string): Promise<Employee[]> => {
    const params = organizationId ? { organizationId } : undefined;
    const res = await apiClient.get<{ success: boolean; employees: Employee[] }>(
      `${BASE}/employees`,
      { params }
    );
    return res.employees;
  },

  /** Paginated employee search with name/email/dept/manager/status filters. */
  searchEmployees: async (
    organizationId?: string,
    params: EmployeeSearchParams = {},
  ): Promise<PaginatedEmployees> => {
    const queryParams: Record<string, string | number> = {};
    if (organizationId) {
      queryParams.organizationId = organizationId;
    }
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams[key] = value as string | number;
      }
    });

    const res = await apiClient.get<{ success: boolean } & PaginatedEmployees>(
      `${BASE}/employees/search`,
      { params: queryParams },
    );
    return { data: res.data, total: res.total, page: res.page, limit: res.limit, totalPages: res.totalPages };
  },

  /** Get a single employee by their Employee record ID. */
  getEmployee: async (id: string): Promise<Employee> => {
    const res = await apiClient.get<{ success: boolean; employee: Employee }>(
      `${BASE}/employees/${id}`,
    );
    return res.employee;
  },

  /** Full employee profile: personal info, dept, manager, direct reports. */
  getEmployeeProfile: async (id: string): Promise<Employee> => {
    const res = await apiClient.get<{ success: boolean; employee: Employee }>(
      `${BASE}/employees/${id}/profile`,
    );
    return res.employee;
  },

  /** Create a new employee record linked to an existing user. */
  createEmployee: async (data: CreateEmployeeInput): Promise<Employee> => {
    const res = await apiClient.post<{ success: boolean; employee: Employee }>(
      `${BASE}/employees`,
      data,
    );
    return res.employee;
  },

  /** Update an employee's title or employment status. */
  updateEmployee: async (id: string, data: UpdateEmployeeInput): Promise<Employee> => {
    const res = await apiClient.patch<{ success: boolean; employee: Employee }>(
      `${BASE}/employees/${id}`,
      data,
    );
    return res.employee;
  },

  /** Remove an employee record. */
  deleteEmployee: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/employees/${id}`);
  },

  // ─────────────────── ASSIGNMENT ───────────────────

  /** Assign or reassign an employee to a department. Pass null to orphan. */
  assignDepartment: async (
    employeeId: string,
    departmentId: string | null,
  ): Promise<Employee> => {
    const res = await apiClient.patch<{ success: boolean; employee: Employee }>(
      `${BASE}/employees/${employeeId}/department`,
      { departmentId },
    );
    return res.employee;
  },

  /** Assign a manager to an employee. Pass null to remove. */
  assignManager: async (
    employeeId: string,
    managerId: string | null,
  ): Promise<Employee> => {
    const res = await apiClient.patch<{ success: boolean; employee: Employee }>(
      `${BASE}/employees/${employeeId}/manager`,
      { managerId },
    );
    return res.employee;
  },

  // ─────────────────── ORG DIRECTORY ───────────────────

  /** Browsable org directory: all employees with dept + manager inline. */
  getOrgDirectory: async (organizationId?: string): Promise<Employee[]> => {
    const params = organizationId ? { organizationId } : undefined;
    const res = await apiClient.get<{ success: boolean; directory: Employee[] }>(
      `${BASE}/directory`,
      { params }
    );
    return res.directory;
  },
};
