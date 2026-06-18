// types/credential.types.ts

export type VerifyStatus = 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
export type CredentialTier = 'FORGE' | 'ARENA' | 'CITADEL';
export type CredentialType = 'PROGRAM' | 'ASSESSMENT' | 'MERIT';

export interface CredentialTemplate {
    id: string;
    type: CredentialType;
    name: string;
    description: string;
    defaultTier: CredentialTier;
    institutionId: string;
}

export interface UserSnippet {
    id: string;
    name: string;
}

export interface ProgramSnippet {
    id: string;
    title: string;
}

export interface InstitutionSnippet {
    id: string;
    name: string;
    logoUrl?: string; // Adding logoUrl for branding
}

export interface Credential {
    id: string;
    userId: string;
    programId: string;
    institutionId: string;
    issuedById: string;
    tier: CredentialTier;
    verificationCode: string;
    verificationUrl: string;
    verificationStatus: VerifyStatus;
    issuedAt: string;
    
    // New Template Integration Fields
    credentialType: CredentialType;
    templateId: string;
    
    // Relations (Populated from backend)
    user?: UserSnippet;
    program?: ProgramSnippet;
    institution?: InstitutionSnippet;
    template?: CredentialTemplate;
}

export interface CreateCredentialDto {
    userId: string;
    programId: string;
    institutionId: string;
    issuedById: string;
    tier?: CredentialTier; // Made optional so template default can be used
    templateId: string;
    credentialType: CredentialType;
    metadata?: string;
}

export interface UpdateCredentialStatusDto {
    status: VerifyStatus;
}