import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class UpdateCredentialStateDto {
  @IsString()
  @IsNotEmpty()
  action: string; // Expected values: GRANT, REVOKE, FREEZE, SET_LIMIT, TAG, PERMANENT_FREEZE, DELETE

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
