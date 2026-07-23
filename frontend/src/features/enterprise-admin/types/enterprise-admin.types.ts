// ─────────────────── ENUMS (mirroring Prisma schema) ───────────────────

export enum EmploymentStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  OFFBOARDED = 'OFFBOARDED',
}

export enum OrgSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

export enum OrgAdminRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

// ─────────────────── ENTITY TYPES ───────────────────

export interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: string | null;
  size: OrgSize | null;
  billingEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentManager {
  id: string;
  user: { id: string; name: string; email: string };
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  managerId: string | null;
  manager: DepartmentManager | null;
  _count: { employees: number };
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface EmployeeDept {
  id: string;
  name: string;
}

export interface EmployeeManagerRef {
  id: string;
  user: { id: string; name: string; email: string };
}

export interface DirectReport {
  id: string;
  user: { id: string; name: string; email: string };
  department: EmployeeDept | null;
}

export interface Employee {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string | null;
  managerId: string | null;
  title: string | null;
  employmentStatus: EmploymentStatus;
  invitedAt: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: EmployeeUser;
  department: EmployeeDept | null;
  manager: EmployeeManagerRef | null;
  directReports: DirectReport[];
}

// ─────────────────── PAGINATION ───────────────────

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────── DEPT STATS ───────────────────

export interface DepartmentStatEntry {
  id: string;
  name: string;
  description: string | null;
  headcount: number;
  manager: { id: string; name: string; email: string } | null;
}

export interface DepartmentStats {
  departments: DepartmentStatEntry[];
  summary: {
    totalDepartments: number;
    totalEmployees: number;
    departmentsWithManager: number;
    departmentsWithoutManager: number;
  };
}

// ─────────────────── FORM INPUT TYPES ───────────────────

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  organizationId: string;
  managerId?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  description?: string;
}

export interface CreateEmployeeInput {
  userId: string;
  organizationId: string;
  departmentId?: string;
  title?: string;
  employmentStatus?: EmploymentStatus;
}

export interface UpdateEmployeeInput {
  title?: string;
  employmentStatus?: EmploymentStatus;
}

export interface EmployeeSearchParams {
  query?: string;
  departmentId?: string;
  managerId?: string;
  status?: EmploymentStatus;
  page?: number;
  limit?: number;
}

export interface UpdateOrgSettingsInput {
  name?: string;
  logoUrl?: string;
  industry?: string;
  size?: OrgSize;
  billingEmail?: string;
}
