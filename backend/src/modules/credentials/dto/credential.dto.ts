import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from "class-validator";
import { CredentialTier, VerifyStatus } from "@prisma/client";

// ─────────────────── ISSUE CREDENTIAL DTO ───────────────────

export class IssueCredentialDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsString()
  @IsNotEmpty()
  institutionId: string;

  @IsEnum(CredentialTier)
  tier: CredentialTier;

  @IsString()
  @IsOptional()
  metadata?: string;
}

// ─────────────────── UPDATE CREDENTIAL DTO ───────────────────

export class UpdateCredentialDto {
  @IsString()
  @IsOptional()
  metadata?: string;
}

// ─────────────────── UPDATE CREDENTIAL STATUS DTO ───────────────────

export class UpdateCredentialStatusDto {
  @IsEnum(VerifyStatus)
  status: VerifyStatus;
}
