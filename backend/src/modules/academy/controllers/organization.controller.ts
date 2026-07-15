import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateOrganizationService } from '../services/organization/create-organization.service';
import { GetOrganizationService } from '../services/organization/get-organization.service';
import { UpdateOrganizationService } from '../services/organization/update-organization.service';
import { DeleteOrganizationService } from '../services/organization/delete-organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';

/**
 * REST Controller for managing Organizations.
 * Exposes endpoints for Enterprise registration and CRUD operations.
 */
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrgService: CreateOrganizationService,
    private readonly getOrgService: GetOrganizationService,
    private readonly updateOrgService: UpdateOrganizationService,
    private readonly deleteOrgService: DeleteOrganizationService,
  ) {}

  /**
   * Registers a new Enterprise organization.
   * @param dto The data required to create an organization.
   * @returns The newly created Organization.
   */
  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    return this.createOrgService.execute(dto);
  }

  /**
   * Retrieves a list of all organizations.
   * @returns An array of Organizations.
   */
  @Get()
  async findAll() {
    return this.getOrgService.findAll();
  }

  /**
   * Retrieves a specific organization by its ID.
   * @param id The UUID of the organization.
   * @returns The Organization record.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getOrgService.findById(id);
  }

  /**
   * Updates an existing organization's profile and settings.
   * @param id The UUID of the organization.
   * @param dto The updated data.
   * @returns The updated Organization.
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.updateOrgService.execute(id, dto);
  }

  /**
   * Deletes an organization from the system.
   * @param id The UUID of the organization to delete.
   * @returns The deleted Organization.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteOrgService.execute(id);
  }
}
