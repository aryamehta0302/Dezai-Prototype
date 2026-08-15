import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a Department within an Organization.
 */
export class CreateDepartmentDto {
  /**
   * The name of the department.
   * @example "Engineering"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Optional description of the department's function.
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Optional ID of the employee who manages this department.
   */
  @IsOptional()
  @IsString()
  managerId?: string;
}

/**
 * Data Transfer Object for updating an existing Department.
 */
export class UpdateDepartmentDto {
  /**
   * The new name of the department.
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * The new description of the department.
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * The new manager's employee ID for the department.
   */
  @IsOptional()
  @IsString()
  managerId?: string;
}
