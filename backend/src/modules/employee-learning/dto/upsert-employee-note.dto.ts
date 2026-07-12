import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpsertEmployeeNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
