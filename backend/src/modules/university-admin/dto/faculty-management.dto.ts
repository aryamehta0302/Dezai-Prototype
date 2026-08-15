import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateFacultyRegistrationDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  universityEmail: string;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;
}

export class UpdateFacultyProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;
}

export class RejectFacultyDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
