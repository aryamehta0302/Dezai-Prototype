import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from '../../repositories/department.repository';
import { Department } from '@prisma/client';

/**
 * Service responsible for deleting a Department.
 */
@Injectable()
export class DeleteDepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * Executes the deletion logic for a department.
   * @param id The UUID of the department to delete.
   * @returns The deleted Department record.
   * @throws NotFoundException if the department does not exist.
   */
  async execute(id: string): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.departmentRepository.delete({ id });
  }
}
