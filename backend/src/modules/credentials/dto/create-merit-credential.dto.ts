import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { CredentialTier } from '@prisma/client';

export class CreateMeritCredentialDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  programId: string; // Context program

  @IsString()
  @IsNotEmpty()
  institutionId: string;

  @IsEnum(CredentialTier)
  @IsNotEmpty()
  tier: CredentialTier;

  @IsString()
  @IsNotEmpty()
  awardTitle: string; // e.g., "Batch Topper"

  @IsString()
  @IsNotEmpty()
  description: string;
}
