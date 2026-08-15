import { IsString, IsNotEmpty, IsObject, IsOptional, IsNumber } from 'class-validator';

/**
 * Sprint 7: DTO for PATCH /api/assessments/attempts/sync
 * Allows the frontend to batch-sync buffered answers from an offline queue.
 */
export class SyncAnswersDto {
  @IsString()
  @IsNotEmpty()
  attemptId: string;

  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;

  @IsOptional()
  @IsNumber()
  clientTimestamp?: number;
}

export interface SyncResponseDto {
  syncedCount: number;
  serverTimestamp: number;
}
