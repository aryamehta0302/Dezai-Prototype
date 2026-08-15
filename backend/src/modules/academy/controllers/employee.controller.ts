import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InviteEmployeeService } from '../services/employee/invite-employee.service';
import { AcceptInvitationService } from '../services/employee/accept-invitation.service';
import { GetEmployeesService } from '../services/employee/get-employees.service';
import { RemoveEmployeeService } from '../services/employee/remove-employee.service';
import { InviteEmployeeDto, AcceptInvitationDto } from '../dto/employee.dto';

/**
 * REST Controller for Team Management & Employee Invitation Flow.
 * Handles inviting employees and managing their lifecycle within an organization.
 */
@Controller('organizations/:organizationId/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DEZAI_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER)
export class EmployeeController {
  constructor(
    private readonly inviteEmpService: InviteEmployeeService,
    private readonly acceptInviteService: AcceptInvitationService,
    private readonly getEmpsService: GetEmployeesService,
    private readonly removeEmpService: RemoveEmployeeService,
  ) {}

  /**
   * Invites a new user to join the organization as an employee.
   * @param organizationId The parent organization UUID.
   * @param dto Information about the user to invite.
   * @returns The newly created Employee record (with INVITED status).
   */
  @Post('invite')
  async invite(
    @Param('organizationId') organizationId: string,
    @Body() dto: InviteEmployeeDto,
  ) {
    return this.inviteEmpService.execute(organizationId, dto);
  }

  /**
   * Retrieves the team directory (all employees in the organization).
   * @param organizationId The parent organization UUID.
   * @returns An array of Employee records.
   */
  @Get()
  async findAll(@Param('organizationId') organizationId: string) {
    return this.getEmpsService.findByOrganizationId(organizationId);
  }

  /**
   * Allows an employee to accept their invitation to the organization.
   * @param id The UUID of the employee record being accepted.
   * @param _dto Optional acceptance metadata.
   * @returns The updated Employee record (with ACTIVE status).
   */
  @Post(':id/accept-invitation')
  async acceptInvitation(
    @Param('id') id: string,
    @Body() _dto: AcceptInvitationDto,
  ) {
    return this.acceptInviteService.execute(id);
  }

  /**
   * Removes (offboards) an employee from the organization.
   * @param id The UUID of the employee record to remove.
   * @returns The deleted Employee record.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.removeEmpService.execute(id);
  }
}
