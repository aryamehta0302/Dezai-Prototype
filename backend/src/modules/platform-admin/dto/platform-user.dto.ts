import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class SuspendUserDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class AssignAdminRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsOptional()
  institutionId?: string;
}
