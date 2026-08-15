import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EmployeeRepository } from '../../repositories/employee.repository';
import { OrganizationRepository } from '../../repositories/organization.repository';
import { InviteEmployeeDto } from '../../dto/employee.dto';
import { Employee, EmploymentStatus } from '@prisma/client';

/**
 * Service responsible for inviting a User to join an Organization as an Employee.
 */
@Injectable()
export class InviteEmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * Executes the invitation process.
   * @param organizationId The UUID of the organization extending the invite.
   * @param dto The data transfer object containing invite details.
   * @returns The created Employee record with status INVITED.
   * @throws NotFoundException if the organization does not exist.
   * @throws ConflictException if the user is already associated with the organization.
   */
  async execute(organizationId: string, dto: InviteEmployeeDto): Promise<Employee> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    const existingEmployee = await this.employeeRepository.findByUserIdAndOrgId(dto.userId, organizationId);
    if (existingEmployee) {
      throw new ConflictException(`User ${dto.userId} is already an employee or invited in this organization`);
    }

    return this.employeeRepository.create({
      user: { connect: { id: dto.userId } },
      organization: { connect: { id: organizationId } },
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : undefined,
      title: dto.title,
      employmentStatus: EmploymentStatus.INVITED,
      invitedAt: new Date(),
    });
  }
}
