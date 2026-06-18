import { IsString, IsNotEmpty, IsObject } from "class-validator";

export class StartAttemptDto {
  @IsString()
  @IsNotEmpty()
  assessmentId: string;
}

export class AutoSaveAnswersDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}
