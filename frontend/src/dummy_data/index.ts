import { Organization, Department, Employee, EmploymentStatus, OrgSize } from '@/features/enterprise-admin/types/enterprise-admin.types';

// Hardcoded mock data
const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Acme Corp',
  logoUrl: null,
  industry: 'Technology',
  size: OrgSize.ENTERPRISE,
  billingEmail: 'billing@acme.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    organizationId: 'org-1',
    name: 'Engineering',
    description: 'Software Engineering Department',
    managerId: 'emp-1',
    manager: {
      id: 'emp-1',
      user: { id: 'u1', name: 'Alice Smith', email: 'alice@acme.com' }
    },
    _count: { employees: 42 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-2',
    organizationId: 'org-1',
    name: 'Sales',
    description: 'Global Sales Team',
    managerId: 'emp-2',
    manager: {
      id: 'emp-2',
      user: { id: 'u2', name: 'Bob Jones', email: 'bob@acme.com' }
    },
    _count: { employees: 15 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    userId: 'u1',
    organizationId: 'org-1',
    departmentId: 'dept-1',
    managerId: null,
    title: 'VP of Engineering',
    employmentStatus: EmploymentStatus.ACTIVE,
    invitedAt: null,
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: { id: 'u1', name: 'Alice Smith', email: 'alice@acme.com', role: 'EMPLOYEE' },
    department: { id: 'dept-1', name: 'Engineering' },
    manager: null,
    directReports: []
  },
  {
    id: 'emp-2',
    userId: 'u2',
    organizationId: 'org-1',
    departmentId: 'dept-2',
    managerId: null,
    title: 'Head of Sales',
    employmentStatus: EmploymentStatus.ACTIVE,
    invitedAt: null,
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: { id: 'u2', name: 'Bob Jones', email: 'bob@acme.com', role: 'EMPLOYEE' },
    department: { id: 'dept-2', name: 'Sales' },
    manager: null,
    directReports: []
  }
];

export async function handleMockRequest(endpoint: string, method: string, options: any) {
  console.log(`[MOCK API] ${method} ${endpoint}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Enterprise Admin Endpoints
  if (path.includes('/enterprise-admin/organizations/current')) {
    return { success: true, organization: mockOrganization };
  }
  
  if (path.includes('/enterprise-admin/departments-stats')) {
    return {
      success: true,
      departments: mockDepartments.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        headcount: d._count.employees,
        manager: d.manager ? d.manager.user : null
      })),
      summary: {
        totalDepartments: mockDepartments.length,
        totalEmployees: mockEmployees.length,
        departmentsWithManager: mockDepartments.filter(d => d.manager).length,
        departmentsWithoutManager: mockDepartments.filter(d => !d.manager).length,
      }
    };
  }
  
  if (path.includes('/enterprise-admin/departments')) {
    return { success: true, departments: mockDepartments };
  }

  if (path.includes('/enterprise-admin/employees/search')) {
    return { 
      success: true, 
      data: mockEmployees,
      total: mockEmployees.length,
      page: 1,
      limit: 10,
      totalPages: 1
    };
  }

  if (path.includes('/enterprise-admin/employees')) {
    return { success: true, employees: mockEmployees };
  }

  if (path.includes('/enterprise-admin/directory')) {
    return { success: true, directory: mockEmployees };
  }

  // Dashboard Metrics
  if (path.includes('/dashboard')) {
    return {
      success: true,
      metrics: {
        totalUsers: 100,
        activePrograms: 5,
        totalRevenue: 50000
      }
    };
  }

  // Fallback default response
  console.warn(`[MOCK API] Unhandled endpoint: ${path}`);
  return null;
}
