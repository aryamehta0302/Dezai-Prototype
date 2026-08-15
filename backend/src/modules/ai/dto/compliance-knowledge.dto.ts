import { ComplianceGeneratedContentType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UploadComplianceDocumentDto {
  @IsString()
  @IsOptional()
  @MaxLength(160)
  title?: string;

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}

export class ComplianceChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  message: string;

  @IsUUID()
  @IsOptional()
  documentId?: string;

  @IsUUID()
  @IsOptional()
  activeProgramId?: string;

  @IsUUID()
  @IsOptional()
  activeModuleId?: string;

  @IsUUID()
  @IsOptional()
  activeLessonId?: string;
}

export class RegenerateComplianceContentDto {
  @IsEnum(ComplianceGeneratedContentType)
  @IsOptional()
  type?: ComplianceGeneratedContentType;
}

export interface ComplianceDocumentSummaryDto {
  id: string;
  organizationId: string;
  title: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  chunkCount: number;
  createdAt: Date;
}

export interface ComplianceChatCitationDto {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkIndex: number;
  excerpt: string;
}
