import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { FacultyVerificationStatus } from '@prisma/client';

// ─────────────────── INSTITUTION DTOs ───────────────────

export class CreateInstitutionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

export class UpdateInstitutionDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

// ─────────────────── FACULTY VERIFICATION DTO ───────────────────

export class UpdateFacultyVerificationDto {
  @IsEnum(FacultyVerificationStatus)
  @IsNotEmpty()
  verificationStatus: FacultyVerificationStatus;
}
