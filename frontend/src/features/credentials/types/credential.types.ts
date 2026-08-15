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
    email?: string;
}

export interface ProgramSnippet {
    id: string;
    title: string;
    institution?: InstitutionSnippet;
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
    metadata?: string;
    credentialTemplateId?: string;
    
    // Relations (Populated from backend)
    user?: UserSnippet;
    program?: ProgramSnippet;
    institution?: InstitutionSnippet;
    issuer?: UserSnippet;
    credentialTemplate?: CredentialTemplate;
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
    reason?: string;
}

export type PublicCredential = Credential;

export interface CredentialSearchParams {
    query?: string;
    status?: VerifyStatus;
    tier?: CredentialTier;
    programId?: string;
    issuerId?: string;
    institutionId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export interface SearchResult {
    data: Credential[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ActivityEntry {
    id: string;
    userId: string | null;
    action: string;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string; role: string } | null;
}

export interface ActivityFeedResult {
    data: ActivityEntry[];
    total: number;
    limit: number;
    offset: number;
}

export interface EnhancedAnalytics {
    statusCounts: { ACTIVE: number; SUSPENDED: number; REVOKED: number };
    programStats: { programId: string; programTitle: string; count: number }[];
    issuerStats: { issuedById: string; issuerName: string; count: number }[];
    dailyActivity: { date: string; issued: number; revoked: number; suspended: number }[];
    tierStats: { FORGE: number; ARENA: number; CITADEL: number };
}

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
