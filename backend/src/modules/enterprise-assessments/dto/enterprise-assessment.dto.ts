import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
  MaxLength,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty, ComplianceTrack, QuestionBankSourceType } from '@prisma/client';

// ─────────────────── ENTERPRISE QUESTION BANK DTOs ───────────────────

export class CreateEnterpriseQuestionBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsEnum(ComplianceTrack)
  complianceTrack: ComplianceTrack;

  @IsEnum(QuestionBankSourceType)
  @IsOptional()
  sourceType?: QuestionBankSourceType;

  @IsString()
  @IsOptional()
  sourceDocumentId?: string;
}

export class UpdateEnterpriseQuestionBankDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ComplianceTrack)
  @IsOptional()
  complianceTrack?: ComplianceTrack;
}

// ─────────────────── ENTERPRISE QUESTION DTOs ───────────────────

export class CreateEnterpriseQuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

export class CreateEnterpriseQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(600)
  timerSeconds?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2)
  @Type(() => CreateEnterpriseQuestionOptionDto)
  options: CreateEnterpriseQuestionOptionDto[];
}

export class UpdateEnterpriseQuestionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(600)
  timerSeconds?: number;
}

// ─────────────────── COMPLIANCE ASSESSMENT DTOs ───────────────────

export class CreateComplianceAssessmentDto {
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsNotEmpty()
  questionBankId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsEnum(ComplianceTrack)
  complianceTrack: ComplianceTrack;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  passingScore?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  sampleSize?: number;

  @IsInt()
  @IsOptional()
  @Min(60)
  timeLimit?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxAttempts?: number;

  @IsBoolean()
  @IsOptional()
  timeLimitEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  allowResume?: boolean;
}

export class UpdateComplianceAssessmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  passingScore?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  sampleSize?: number;

  @IsInt()
  @IsOptional()
  @Min(60)
  timeLimit?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxAttempts?: number;

  @IsBoolean()
  @IsOptional()
  timeLimitEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  allowResume?: boolean;
}

// ─────────────────── ATTEMPT DTOs ───────────────────

export class StartComplianceAttemptDto {
  @IsString()
  @IsNotEmpty()
  assessmentId: string;
}

export class SubmitComplianceAttemptDto {
  @IsObject()
  answers: Record<string, string>;
}

// ─────────────────── AI INGESTION DTO ───────────────────

export class IngestGeneratedAssessmentDto {
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsEnum(ComplianceTrack)
  complianceTrack: ComplianceTrack;

  @IsString()
  @IsOptional()
  sourceDocumentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(10, { message: 'Compliance assessments require at least 10 generated questions.' })
  @Type(() => CreateEnterpriseQuestionDto)
  questions: CreateEnterpriseQuestionDto[];
}
