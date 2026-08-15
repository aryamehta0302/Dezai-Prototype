import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EmploymentStatus } from '@prisma/client';

/**
 * Data Transfer Object for inviting a User to join an Organization as an Employee.
 */
export class InviteEmployeeDto {
  /**
   * The ID of the User being invited.
   */
  @IsNotEmpty()
  @IsString()
  userId: string;

  /**
   * Optional ID of the department to assign the employee to.
   */
  @IsOptional()
  @IsString()
  departmentId?: string;

  /**
   * Optional job title for the employee.
   */
  @IsOptional()
  @IsString()
  title?: string;
}

/**
 * Data Transfer Object for accepting an organization invitation.
 */
export class AcceptInvitationDto {
  /**
   * The employee record ID to accept.
   * Typically inferred from the authenticated user context.
   */
  @IsOptional()
  @IsString()
  employeeId?: string; 
}

/**
 * Data Transfer Object for updating an employee's employment status.
 */
export class UpdateEmployeeStatusDto {
  /**
   * The new employment status of the employee.
   */
  @IsNotEmpty()
  @IsEnum(EmploymentStatus)
  status: EmploymentStatus;
}
