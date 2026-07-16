import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from '../../repositories/department.repository';
import { Department } from '@prisma/client';

/**
 * Service responsible for retrieving Department data.
 */
@Injectable()
export class GetDepartmentsService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * Finds a specific department by its UUID.
   * @param id The UUID of the department.
   * @returns The Department record.
   * @throws NotFoundException if the department does not exist.
   */
  async findById(id: string): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  /**
   * Retrieves all departments for a specific organization.
   * @param organizationId The UUID of the organization.
   * @returns An array of Department records.
   */
  async findByOrganizationId(organizationId: string): Promise<Department[]> {
    return this.departmentRepository.findManyByOrgId(organizationId);
  }
}
