import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from '../../repositories/department.repository';
import { UpdateDepartmentDto } from '../../dto/department.dto';
import { Department } from '@prisma/client';

/**
 * Service responsible for updating existing Department data.
 */
@Injectable()
export class UpdateDepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  /**
   * Executes the update logic for a department.
   * @param id The UUID of the department to update.
   * @param dto The data transfer object containing the updated fields.
   * @returns The updated Department record.
   * @throws NotFoundException if the department does not exist.
   */
  async execute(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.departmentRepository.update({
      where: { id },
      data: dto,
    });
  }
}
