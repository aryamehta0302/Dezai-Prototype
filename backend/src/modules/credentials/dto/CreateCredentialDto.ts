import { CredentialTier } from '@prisma/client';
import { CredentialType } from './TemplateDto';

export class CreateCredentialDto {
    userId!: string;
    programId!: string;
    institutionId!: string;
    issuedById!: string; // Faculty or System ID
    tier!: CredentialTier; // FORGE, ARENA, CITADEL
    
    // New Template Integration Fields
    templateId!: string;
    credentialType!: CredentialType;
}