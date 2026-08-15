import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../../repositories/organization.repository';
import { Organization } from '@prisma/client';

/**
 * Service responsible for retrieving Organization data.
 */
@Injectable()
export class GetOrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  /**
   * Finds a specific organization by its UUID.
   * @param id The UUID of the organization.
   * @returns The Organization record.
   * @throws NotFoundException if the organization does not exist.
   */
  async findById(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  /**
   * Retrieves all organizations in the system.
   * @returns An array of all Organization records.
   */
  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.findAll({});
  }
}
