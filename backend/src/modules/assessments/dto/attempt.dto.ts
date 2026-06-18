import { IsString, IsNotEmpty, IsObject, IsOptional } from "class-validator";

export class StartAttemptDto {
  @IsString()
  @IsNotEmpty()
  assessmentId: string;
}

export class SubmitAnswerDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}

export class AutoSaveAnswersDto extends SubmitAnswerDto {}

export class SubmitAttemptDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
