import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateFacultyProfileDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  department?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  designation?: string;
}
