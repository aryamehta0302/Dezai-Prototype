import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Department, Prisma } from '@prisma/client';

/**
 * Repository class for managing Department records in the database.
 * Encapsulates all Prisma client calls related to the Department entity.
 */
@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new department in the database.
   * @param data The input data required to create a department.
   * @returns The newly created Department record.
   */
  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return this.prisma.department.create({ data });
  }

  /**
   * Retrieves a department by its unique identifier.
   * @param id The UUID of the department.
   * @returns The Department record including its manager, or null if not found.
   */
  async findById(id: string): Promise<Department | null> {
    return this.prisma.department.findUnique({
      where: { id },
      include: { manager: true },
    });
  }

  /**
   * Retrieves all departments associated with a specific organization.
   * @param organizationId The UUID of the organization.
   * @returns An array of Department records belonging to the organization.
   */
  async findManyByOrgId(organizationId: string): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { organizationId },
      include: { manager: true },
    });
  }

  /**
   * Updates an existing department's data.
   * @param params An object containing the unique identifier (where) and the new data (data).
   * @returns The updated Department record.
   */
  async update(params: {
    where: Prisma.DepartmentWhereUniqueInput;
    data: Prisma.DepartmentUpdateInput;
  }): Promise<Department> {
    const { where, data } = params;
    return this.prisma.department.update({
      data,
      where,
    });
  }

  /**
   * Deletes a department from the database.
   * @param where The unique identifier criteria for deletion.
   * @returns The deleted Department record.
   */
  async delete(where: Prisma.DepartmentWhereUniqueInput): Promise<Department> {
    return this.prisma.department.delete({
      where,
    });
  }
}
