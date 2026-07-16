import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationAdmin, Prisma } from '@prisma/client';

/**
 * Repository class for managing Organization Admin (RBAC) records in the database.
 * Encapsulates all Prisma client calls related to the OrganizationAdmin entity.
 */
@Injectable()
export class OrganizationAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new organization admin record.
   * @param data The input data mapping a user to an organization role.
   * @returns The newly created OrganizationAdmin record.
   */
  async create(data: Prisma.OrganizationAdminCreateInput): Promise<OrganizationAdmin> {
    return this.prisma.organizationAdmin.create({ data });
  }

  /**
   * Retrieves an organization admin by their unique identifier.
   * @param id The UUID of the admin record.
   * @returns The OrganizationAdmin record including user details, or null if not found.
   */
  async findById(id: string): Promise<OrganizationAdmin | null> {
    return this.prisma.organizationAdmin.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Retrieves an admin record based on their underlying User ID.
   * @param userId The UUID of the user.
   * @param organizationId The UUID of the organization.
   * @returns The OrganizationAdmin record or null if not found.
   */
  async findByUserIdAndOrgId(userId: string, organizationId: string): Promise<OrganizationAdmin | null> {
    return this.prisma.organizationAdmin.findUnique({
      where: { userId }, // userId is unique across org admins
    });
  }

  /**
   * Retrieves all admins associated with a specific organization.
   * @param organizationId The UUID of the organization.
   * @returns An array of OrganizationAdmin records.
   */
  async findManyByOrgId(organizationId: string): Promise<OrganizationAdmin[]> {
    return this.prisma.organizationAdmin.findMany({
      where: { organizationId },
      include: { user: true },
    });
  }

  /**
   * Deletes an organization admin record from the database.
   * @param where The unique identifier criteria for deletion.
   * @returns The deleted OrganizationAdmin record.
   */
  async delete(where: Prisma.OrganizationAdminWhereUniqueInput): Promise<OrganizationAdmin> {
    return this.prisma.organizationAdmin.delete({
      where,
    });
  }
}
