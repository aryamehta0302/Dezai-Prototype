import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../../repositories/organization.repository';
import { Organization } from '@prisma/client';

/**
 * Service responsible for deleting an Organization.
 */
@Injectable()
export class DeleteOrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  /**
   * Executes the deletion logic for an organization.
   * @param id The UUID of the organization to delete.
   * @returns The deleted Organization record.
   * @throws NotFoundException if the organization does not exist.
   */
  async execute(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return this.organizationRepository.delete({ id });
  }
}
