import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateDepartmentService } from '../services/department/create-department.service';
import { GetDepartmentsService } from '../services/department/get-departments.service';
import { UpdateDepartmentService } from '../services/department/update-department.service';
import { DeleteDepartmentService } from '../services/department/delete-department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';

/**
 * REST Controller for managing Departments within an Organization.
 * Endpoints are nested under `/organizations/:organizationId`.
 */
@Controller('organizations/:organizationId/departments')
export class DepartmentController {
  constructor(
    private readonly createDeptService: CreateDepartmentService,
    private readonly getDeptsService: GetDepartmentsService,
    private readonly updateDeptService: UpdateDepartmentService,
    private readonly deleteDeptService: DeleteDepartmentService,
  ) {}

  /**
   * Creates a new department in the specified organization.
   * @param organizationId The parent organization UUID.
   * @param dto The data required to create a department.
   * @returns The newly created Department.
   */
  @Post()
  async create(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.createDeptService.execute(organizationId, dto);
  }

  /**
   * Retrieves all departments for a given organization.
   * @param organizationId The parent organization UUID.
   * @returns An array of Departments.
   */
  @Get()
  async findAll(@Param('organizationId') organizationId: string) {
    return this.getDeptsService.findByOrganizationId(organizationId);
  }

  /**
   * Retrieves a specific department by its ID.
   * @param id The UUID of the department.
   * @returns The Department record.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getDeptsService.findById(id);
  }

  /**
   * Updates an existing department's details.
   * @param id The UUID of the department.
   * @param dto The updated data.
   * @returns The updated Department.
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.updateDeptService.execute(id, dto);
  }

  /**
   * Deletes a department.
   * @param id The UUID of the department to delete.
   * @returns The deleted Department.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteDeptService.execute(id);
  }
}
