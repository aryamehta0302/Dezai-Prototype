import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EmployeeRepository } from '../../repositories/employee.repository';
import { Employee, EmploymentStatus } from '@prisma/client';

/**
 * Service responsible for accepting an organization invitation.
 */
@Injectable()
export class AcceptInvitationService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  /**
   * Executes the acceptance process by changing the employee status to ACTIVE.
   * @param id The UUID of the employee record to accept.
   * @returns The updated Employee record.
   * @throws NotFoundException if the employee record does not exist.
   * @throws BadRequestException if the current status is not INVITED.
   */
  async execute(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee record with ID ${id} not found`);
    }

    if (employee.employmentStatus !== EmploymentStatus.INVITED) {
      throw new BadRequestException(`Employee status is not INVITED (Current: ${employee.employmentStatus})`);
    }

    return this.employeeRepository.update({
      where: { id },
      data: {
        employmentStatus: EmploymentStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });
  }
}
