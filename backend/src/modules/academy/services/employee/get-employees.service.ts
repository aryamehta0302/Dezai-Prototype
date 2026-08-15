import { Injectable } from '@nestjs/common';
import { EmployeeRepository } from '../../repositories/employee.repository';
import { Employee } from '@prisma/client';

/**
 * Service responsible for retrieving Employee data for an Organization.
 */
@Injectable()
export class GetEmployeesService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  /**
   * Retrieves all employees (the team directory) for a specific organization.
   * @param organizationId The UUID of the organization.
   * @returns An array of Employee records.
   */
  async findByOrganizationId(organizationId: string): Promise<Employee[]> {
    return this.employeeRepository.findManyByOrgId(organizationId);
  }
}
