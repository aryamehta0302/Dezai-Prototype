import { Injectable } from '@nestjs/common';
import { OrganizationAdminRepository } from '../../repositories/org-admin.repository';
import { OrganizationAdmin } from '@prisma/client';

/**
 * Service responsible for retrieving Organization Admins.
 */
@Injectable()
export class GetOrgAdminsService {
  constructor(private readonly orgAdminRepository: OrganizationAdminRepository) {}

  /**
   * Retrieves all admins for a specific organization.
   * @param organizationId The UUID of the organization.
   * @returns An array of OrganizationAdmin records.
   */
  async findByOrganizationId(organizationId: string): Promise<OrganizationAdmin[]> {
    return this.orgAdminRepository.findManyByOrgId(organizationId);
  }
}
