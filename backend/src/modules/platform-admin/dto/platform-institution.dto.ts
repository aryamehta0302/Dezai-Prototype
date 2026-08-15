import { IsString, IsOptional } from 'class-validator';

export class RejectInstitutionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class SuspendInstitutionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
