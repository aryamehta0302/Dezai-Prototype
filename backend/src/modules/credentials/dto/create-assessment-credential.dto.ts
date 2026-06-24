import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CredentialTier } from '@prisma/client';

export class CreateAssessmentCredentialDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsString()
  @IsNotEmpty()
  assessmentId: string; // Specific to exam

  @IsString()
  @IsOptional()
  institutionId?: string;

  @IsEnum(CredentialTier)
  @IsNotEmpty()
  tier: CredentialTier;
}
