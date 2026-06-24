import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CredentialTier } from '@prisma/client';

export class CreateProgramCredentialDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsString()
  @IsOptional()
  institutionId?: string;

  @IsEnum(CredentialTier)
  tier: CredentialTier;
}
