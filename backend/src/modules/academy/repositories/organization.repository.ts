import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Organization, Prisma } from '@prisma/client';

/**
 * Repository class for managing Organization records in the database.
 * Encapsulates all Prisma client calls related to the Organization entity.
 */
@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new organization in the database.
   * @param data The input data required to create an organization.
   * @returns The newly created Organization record.
   */
  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return this.prisma.organization.create({ data });
  }

  /**
   * Retrieves an organization by its unique identifier.
   * @param id The UUID of the organization.
   * @returns The Organization record or null if not found.
   */
  async findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  /**
   * Retrieves multiple organizations based on the provided query parameters.
   * @param params An object containing optional skip, take, cursor, where, and orderBy properties.
   * @returns An array of Organization records.
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.OrganizationWhereUniqueInput;
    where?: Prisma.OrganizationWhereInput;
    orderBy?: Prisma.OrganizationOrderByWithRelationInput;
  }): Promise<Organization[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.organization.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  /**
   * Updates an existing organization's data.
   * @param params An object containing the unique identifier (where) and the new data (data).
   * @returns The updated Organization record.
   */
  async update(params: {
    where: Prisma.OrganizationWhereUniqueInput;
    data: Prisma.OrganizationUpdateInput;
  }): Promise<Organization> {
    const { where, data } = params;
    return this.prisma.organization.update({
      data,
      where,
    });
  }

  /**
   * Deletes an organization from the database.
   * @param where The unique identifier criteria for deletion.
   * @returns The deleted Organization record.
   */
  async delete(where: Prisma.OrganizationWhereUniqueInput): Promise<Organization> {
    return this.prisma.organization.delete({
      where,
    });
  }
}
