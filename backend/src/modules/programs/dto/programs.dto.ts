import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsUrl,
  Min,
  MaxLength,
} from "class-validator";
import { TrackType } from "@prisma/client";

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  institutionId?: string;
}

export class UpdateProgramDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsOptional()
  isPublished?: boolean;
}

export class CreateTrackDto {
  @IsEnum(TrackType)
  type: TrackType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTrackDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class UpdateModuleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  order?: number;
}

export class ReorderModulesDto {
  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  videoUrl?: string;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  videoUrl?: string;
}
