import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../../repositories/organization.repository';
import { UpdateOrganizationDto } from '../../dto/organization.dto';
import { Organization } from '@prisma/client';

/**
 * Service responsible for updating existing Organization data.
 */
@Injectable()
export class UpdateOrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  /**
   * Executes the update logic for an organization.
   * @param id The UUID of the organization.
   * @param dto The data transfer object with the updated properties.
   * @returns The updated Organization record.
   * @throws NotFoundException if the organization does not exist.
   */
  async execute(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return this.organizationRepository.update({
      where: { id },
      data: dto,
    });
  }
}
