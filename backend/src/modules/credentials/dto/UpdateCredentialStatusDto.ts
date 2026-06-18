import { VerifyStatus } from '@prisma/client';

export class UpdateCredentialStatusDto {
    status!: VerifyStatus; // ACTIVE, SUSPENDED, REVOKED
}