import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { AssignOrgAdminService } from '../services/org-admin/assign-org-admin.service';
import { GetOrgAdminsService } from '../services/org-admin/get-org-admins.service';
import { RemoveOrgAdminService } from '../services/org-admin/remove-org-admin.service';
import { AssignOrgAdminDto } from '../dto/org-admin.dto';

/**
 * REST Controller for managing Organization Administrators (Enterprise RBAC).
 * Handles assigning and removing admin roles within an organization.
 */
@Controller('organizations/:organizationId/admins')
export class OrganizationAdminController {
  constructor(
    private readonly assignAdminService: AssignOrgAdminService,
    private readonly getAdminsService: GetOrgAdminsService,
    private readonly removeAdminService: RemoveOrgAdminService,
  ) {}

  /**
   * Assigns an admin role to a user within the organization.
   * @param organizationId The UUID of the organization.
   * @param dto The user ID and role to assign.
   * @returns The created OrganizationAdmin record.
   */
  @Post()
  async assignAdmin(
    @Param('organizationId') organizationId: string,
    @Body() dto: AssignOrgAdminDto,
  ) {
    return this.assignAdminService.execute(organizationId, dto);
  }

  /**
   * Retrieves all assigned admins for a given organization.
   * @param organizationId The UUID of the organization.
   * @returns An array of OrganizationAdmin records.
   */
  @Get()
  async findAll(@Param('organizationId') organizationId: string) {
    return this.getAdminsService.findByOrganizationId(organizationId);
  }

  /**
   * Removes an admin from the organization by revoking their role.
   * @param id The UUID of the organization admin record.
   * @returns The deleted OrganizationAdmin record.
   */
  @Delete(':id')
  async removeAdmin(@Param('id') id: string) {
    return this.removeAdminService.execute(id);
  }
}
