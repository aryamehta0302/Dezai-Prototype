import { IsObject, IsOptional } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
