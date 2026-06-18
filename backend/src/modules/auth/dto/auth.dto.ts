import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

// ─────────────────── ONBOARDING ───────────────────

export class OnboardUserDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  /** Required when role = FACULTY */
  @IsString()
  @IsOptional()
  institutionId?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  designation?: string;
}

// ─────────────────── REGISTER ───────────────────

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

// ─────────────────── LOGIN ───────────────────

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// ─────────────────── SESSION SYNC ───────────────────

export class SessionSyncDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
