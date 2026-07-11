import { IsEnum, IsString, IsOptional } from 'class-validator';
import { VerifyStatus } from '@prisma/client';

export class UpdateEnterpriseCredentialStatusDto {
    @IsEnum(VerifyStatus)
    status: VerifyStatus;

    @IsString()
    @IsOptional()
    reason?: string;
}
