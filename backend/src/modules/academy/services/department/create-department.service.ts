import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from '../../repositories/department.repository';
import { OrganizationRepository } from '../../repositories/organization.repository';
import { CreateDepartmentDto } from '../../dto/department.dto';
import { Department } from '@prisma/client';

/**
 * Service responsible for creating a new Department within an Organization.
 */
@Injectable()
export class CreateDepartmentService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * Executes the creation of a new department.
   * @param organizationId The parent organization UUID.
   * @param dto The data transfer object containing department details.
   * @returns The newly created Department record.
   * @throws NotFoundException if the organization does not exist.
   */
  async execute(organizationId: string, dto: CreateDepartmentDto): Promise<Department> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    return this.departmentRepository.create({
      ...dto,
      organization: { connect: { id: organizationId } },
    });
  }
}
