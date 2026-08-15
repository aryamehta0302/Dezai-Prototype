import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationAdminRepository } from '../../repositories/org-admin.repository';
import { OrganizationAdmin } from '@prisma/client';

/**
 * Service responsible for revoking an Admin role from a User.
 */
@Injectable()
export class RemoveOrgAdminService {
  constructor(private readonly orgAdminRepository: OrganizationAdminRepository) {}

  /**
   * Executes the role revocation by deleting the OrganizationAdmin record.
   * @param id The UUID of the OrganizationAdmin record to remove.
   * @returns The deleted OrganizationAdmin record.
   * @throws NotFoundException if the record does not exist.
   */
  async execute(id: string): Promise<OrganizationAdmin> {
    const admin = await this.orgAdminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(`Organization Admin with ID ${id} not found`);
    }

    return this.orgAdminRepository.delete({ id });
  }
}
