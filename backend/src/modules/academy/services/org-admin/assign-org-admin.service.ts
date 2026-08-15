import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationAdminRepository } from '../../repositories/org-admin.repository';
import { OrganizationRepository } from '../../repositories/organization.repository';
import { AssignOrgAdminDto } from '../../dto/org-admin.dto';
import { OrganizationAdmin } from '@prisma/client';

/**
 * Service responsible for assigning an Admin role to a User within an Organization.
 */
@Injectable()
export class AssignOrgAdminService {
  constructor(
    private readonly orgAdminRepository: OrganizationAdminRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * Executes the role assignment.
   * @param organizationId The UUID of the organization.
   * @param dto The data transfer object containing the user ID and role.
   * @returns The created OrganizationAdmin record.
   * @throws NotFoundException if the organization does not exist.
   * @throws ConflictException if the user is already an admin in the organization.
   */
  async execute(organizationId: string, dto: AssignOrgAdminDto): Promise<OrganizationAdmin> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const existingAdmin = await this.orgAdminRepository.findByUserIdAndOrgId(dto.userId, organizationId);
    if (existingAdmin) {
      throw new ConflictException(`User ${dto.userId} is already an admin in this organization`);
    }

    return this.orgAdminRepository.create({
      user: { connect: { id: dto.userId } },
      organization: { connect: { id: organizationId } },
      role: dto.role,
    });
  }
}
