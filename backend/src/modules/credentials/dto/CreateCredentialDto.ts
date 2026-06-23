import { CredentialTier, CredentialType } from '@prisma/client';

export class CreateCredentialDto {
    userId!: string;
    programId!: string;
    institutionId!: string;
    issuedById!: string;
    tier!: CredentialTier;
    templateId!: string;
    credentialType!: CredentialType;
}