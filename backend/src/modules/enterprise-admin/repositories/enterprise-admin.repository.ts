import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, EmploymentStatus } from '@prisma/client';
import { EmployeeSearchDto } from '../dto/enterprise-admin.dto';

/** Reusable Prisma select shape for an employee with user, dept, and manager */
export const EMPLOYEE_INCLUDE = {
  user: { select: { id: true, name: true, email: true, role: true } },
  department: { select: { id: true, name: true } },
  manager: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  directReports: {
    include: {
      user: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } },
    },
  },
} as const;

/** Reusable Prisma select shape for a department with manager and headcount */
export const DEPARTMENT_INCLUDE = {
  manager: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  _count: { select: { employees: true } },
} as const;

@Injectable()
export class EnterpriseAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────── DEPARTMENT QUERIES ───────────────────

  async findDepartmentById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: DEPARTMENT_INCLUDE,
    });
  }

  async findAllDepartments(organizationId: string) {
    return this.prisma.department.findMany({
      where: { organizationId },
      include: DEPARTMENT_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(data: Prisma.DepartmentUncheckedCreateInput) {
    return this.prisma.department.create({ data, include: DEPARTMENT_INCLUDE });
  }

  async updateDepartment(id: string, data: Prisma.DepartmentUncheckedUpdateInput) {
    return this.prisma.department.update({ where: { id }, data, include: DEPARTMENT_INCLUDE });
  }

  async deleteDepartment(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }

  // ─────────────────── EMPLOYEE QUERIES ───────────────────

  async findEmployeeById(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: EMPLOYEE_INCLUDE,
    });
  }

  async findEmployeeByUserId(userId: string) {
    return this.prisma.employee.findUnique({
      where: { userId },
      include: EMPLOYEE_INCLUDE,
    });
  }

  async findAllEmployees(organizationId: string) {
    return this.prisma.employee.findMany({
      where: { organizationId },
      include: EMPLOYEE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEmployee(data: Prisma.EmployeeUncheckedCreateInput) {
    return this.prisma.employee.create({ data, include: EMPLOYEE_INCLUDE });
  }

  async updateEmployee(id: string, data: Prisma.EmployeeUncheckedUpdateInput) {
    return this.prisma.employee.update({ where: { id }, data, include: EMPLOYEE_INCLUDE });
  }

  async deleteEmployee(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }

  /**
   * Paginated employee search with optional filters.
   * Pagination envelope matches the existing pattern: { data, total, page, limit, totalPages }.
   */
  async searchEmployees(organizationId: string, params: EmployeeSearchDto) {
    const andConditions: Prisma.EmployeeWhereInput[] = [{ organizationId }];

    if (params.departmentId) {
      andConditions.push({ departmentId: params.departmentId });
    }

    if (params.managerId) {
      andConditions.push({ managerId: params.managerId });
    }

    if (params.status) {
      andConditions.push({ employmentStatus: params.status });
    }

    if (params.query) {
      andConditions.push({
        OR: [
          { user: { name: { contains: params.query, mode: 'insensitive' } } },
          { user: { email: { contains: params.query, mode: 'insensitive' } } },
          { title: { contains: params.query, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.EmployeeWhereInput = { AND: andConditions };
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        include: EMPLOYEE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─────────────────── DEPARTMENT STATS ───────────────────

  /**
   * Aggregate department stats for an organization:
   * headcount per department, and how many have a manager assigned.
   */
  async getDepartmentStats(organizationId: string) {
    const departments = await this.prisma.department.findMany({
      where: { organizationId },
      include: {
        _count: { select: { employees: true } },
        manager: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    const totalEmployees = await this.prisma.employee.count({ where: { organizationId } });
    const withManager = departments.filter((d) => d.managerId !== null).length;
    const withoutManager = departments.length - withManager;

    return {
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        headcount: d._count.employees,
        manager: d.manager
          ? { id: d.manager.id, name: d.manager.user.name, email: d.manager.user.email }
          : null,
      })),
      summary: {
        totalDepartments: departments.length,
        totalEmployees,
        departmentsWithManager: withManager,
        departmentsWithoutManager: withoutManager,
      },
    };
  }

  // ─────────────────── ORG DIRECTORY ───────────────────

  /** Full org directory: all employees with dept + manager inline */
  async getOrgDirectory(organizationId: string) {
    return this.prisma.employee.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        department: { select: { id: true, name: true } },
        manager: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: [
        { department: { name: 'asc' } },
        { user: { name: 'asc' } },
      ],
    });
  }

  // ─────────────────── MANAGER CHAIN HELPER ───────────────────

  /**
   * Walks the manager chain upward from `startEmployeeId`.
   * Returns all ancestor employee IDs to detect circular chains.
   * Stops at depth 50 as a safety cap.
   */
  async getManagerChain(startEmployeeId: string): Promise<string[]> {
    const chain: string[] = [];
    let currentId: string | null = startEmployeeId;
    let depth = 0;

    while (currentId && depth < 50) {
      const emp = await this.prisma.employee.findUnique({
        where: { id: currentId },
        select: { managerId: true },
      });
      if (!emp || !emp.managerId) break;
      chain.push(emp.managerId);
      currentId = emp.managerId;
      depth++;
    }

    return chain;
  }
}
