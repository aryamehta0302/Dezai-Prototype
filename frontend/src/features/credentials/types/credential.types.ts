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

export type PublicCredential = Credential;

export interface TierDisplayInfo {
    label: string;
    borderColor: string;
    bgColor: string;
    color: string;
}

export const CREDENTIAL_TIER_CONFIG: Record<CredentialTier, TierDisplayInfo> = {
    FORGE: { label: 'Forge', borderColor: 'border-slate-500/30', bgColor: 'bg-slate-500/10', color: 'text-slate-400' },
    ARENA: { label: 'Arena', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/10', color: 'text-blue-400' },
    CITADEL: { label: 'Citadel', borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/10', color: 'text-purple-400' },
};
