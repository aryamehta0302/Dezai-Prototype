import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../repositories/organization.repository';
import { CreateOrganizationDto } from '../../dto/organization.dto';
import { Organization } from '@prisma/client';

/**
 * Service responsible for creating a new Organization.
 */
@Injectable()
export class CreateOrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  /**
   * Executes the creation of a new organization.
   * @param dto The data transfer object containing organization details.
   * @returns The newly created Organization record.
   */
  async execute(dto: CreateOrganizationDto): Promise<Organization> {
    // Basic validation or business rules can be added here
    return this.organizationRepository.create({
      ...dto,
    });
  }
}
