import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsEmail,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentStatus, OrgSize, OrgAdminRole } from '@prisma/client';

// ─────────────────── DEPARTMENT DTOs ───────────────────

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  /** organizationId is injected from the authenticated user's org context */
  @IsString()
  @IsOptional()
  organizationId?: string;

  /** Optional: pre-assign a manager employee at creation time */
  @IsString()
  @IsOptional()
  managerId?: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}

// ─────────────────── EMPLOYEE DTOs ───────────────────

export class CreateEmployeeDto {
  /** User account ID to link as an employee */
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsEnum(EmploymentStatus)
  @IsOptional()
  employmentStatus?: EmploymentStatus;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsEnum(EmploymentStatus)
  @IsOptional()
  employmentStatus?: EmploymentStatus;
}

// ─────────────────── ASSIGNMENT DTOs ───────────────────

export class AssignDepartmentDto {
  /** The department to move the employee into. Null to orphan. */
  @IsString()
  @IsOptional()
  departmentId?: string | null;
}

export class AssignManagerDto {
  /**
   * The employee ID to set as this employee's manager.
   * Null to remove a manager assignment.
   */
  @IsString()
  @IsOptional()
  managerId?: string | null;
}

// ─────────────────── SEARCH / FILTER DTOs ───────────────────

/**
 * Query params DTO for employee search.
 * Matches the existing pagination envelope: { data, total, page, limit, totalPages }.
 */
export class EmployeeSearchDto {
  /** Full-text search across name and email */
  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsEnum(EmploymentStatus)
  @IsOptional()
  status?: EmploymentStatus;

  /** Page number, 1-indexed */
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  /** Items per page; capped at 100 */
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}

// ─────────────────── ORG SETTINGS DTOs ───────────────────

export class UpdateOrgSettingsDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @IsEnum(OrgSize)
  @IsOptional()
  size?: OrgSize;

  @IsEmail()
  @IsOptional()
  billingEmail?: string;
}
