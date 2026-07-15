import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
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
