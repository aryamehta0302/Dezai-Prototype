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
} from "class-validator";
import { Type } from "class-transformer";

// ─────────────────── QUESTION BANK DTOs ───────────────────

export class CreateQuestionBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  institutionId?: string;
}

export class UpdateQuestionBankDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

// ─────────────────── QUESTION DTOs ───────────────────

export class CreateQuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(600)
  timerSeconds?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2)
  @Type(() => CreateQuestionOptionDto)
  options: CreateQuestionOptionDto[];
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(600)
  timerSeconds?: number;
}

// ─────────────────── ASSESSMENT DTOs ───────────────────

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @IsString()
  @IsNotEmpty()
  questionBankId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  passingScore?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  sampleSize?: number;
}

export class UpdateAssessmentDto {
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
}
