import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Employee, Prisma } from '@prisma/client';

/**
 * Repository class for managing Employee records in the database.
 * Encapsulates all Prisma client calls related to the Employee entity.
 */
@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new employee record in the database.
   * @param data The input data required to create an employee.
   * @returns The newly created Employee record.
   */
  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return this.prisma.employee.create({ data });
  }

  /**
   * Retrieves an employee by their unique identifier.
   * @param id The UUID of the employee record.
   * @returns The Employee record including user and department relations, or null if not found.
   */
  async findById(id: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      include: { user: true, department: true },
    });
  }

  /**
   * Retrieves an employee record based on their underlying User ID within a specific organization.
   * @param userId The UUID of the user.
   * @param organizationId The UUID of the organization.
   * @returns The Employee record or null if not found.
   */
  async findByUserIdAndOrgId(userId: string, organizationId: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { userId }, // userId is unique across employees table per schema
    });
  }

  /**
   * Retrieves all employees associated with a specific organization.
   * @param organizationId The UUID of the organization.
   * @returns An array of Employee records belonging to the organization.
   */
  async findManyByOrgId(organizationId: string): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: { organizationId },
      include: { user: true, department: true },
    });
  }

  /**
   * Updates an existing employee's data.
   * @param params An object containing the unique identifier (where) and the new data (data).
   * @returns The updated Employee record.
   */
  async update(params: {
    where: Prisma.EmployeeWhereUniqueInput;
    data: Prisma.EmployeeUpdateInput;
  }): Promise<Employee> {
    const { where, data } = params;
    return this.prisma.employee.update({
      data,
      where,
    });
  }

  /**
   * Deletes an employee record from the database.
   * @param where The unique identifier criteria for deletion.
   * @returns The deleted Employee record.
   */
  async delete(where: Prisma.EmployeeWhereUniqueInput): Promise<Employee> {
    return this.prisma.employee.delete({
      where,
    });
  }
}
