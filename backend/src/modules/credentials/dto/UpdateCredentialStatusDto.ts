import { VerifyStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCredentialStatusDto {
    @IsEnum(VerifyStatus)
    status!: VerifyStatus; // ACTIVE, SUSPENDED, REVOKED
    reason?: string;
}