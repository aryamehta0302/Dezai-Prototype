import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class SubmitComplianceAttemptDto {
  @IsObject()
  answers: Record<string, string>;

  @IsOptional()
  @IsNumber()
  timeTakenSeconds?: number;
}
