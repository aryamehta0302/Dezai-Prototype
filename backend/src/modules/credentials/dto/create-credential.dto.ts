import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CredentialTier, CredentialType } from '@prisma/client';

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsString()
  @IsNotEmpty()
  institutionId: string;

  @IsEnum(CredentialTier)
  @IsNotEmpty()
  tier: CredentialTier;

  @IsEnum(CredentialType)
  @IsOptional()
  type?: CredentialType;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsString()
  @IsOptional()
  metadata?: string;
}
