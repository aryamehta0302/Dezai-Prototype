import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeRepository } from '../../repositories/employee.repository';
import { Employee } from '@prisma/client';

/**
 * Service responsible for removing (offboarding) an Employee from an Organization.
 */
@Injectable()
export class RemoveEmployeeService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  /**
   * Executes the employee removal by deleting the record.
   * @param id The UUID of the employee record to remove.
   * @returns The deleted Employee record.
   * @throws NotFoundException if the employee does not exist.
   */
  async execute(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.employeeRepository.delete({ id });
  }
}
