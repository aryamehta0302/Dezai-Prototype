export enum CredentialTier {
  FORGE = 'FORGE',
  ARENA = 'ARENA',
  CITADEL = 'CITADEL',
}

export enum VerifyStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  SUSPENDED = 'SUSPENDED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface InstitutionSnippet {
    id: string;
    name: string;
    logoUrl?: string;
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

export enum CredentialType {
  PROGRAM = 'PROGRAM',
  ASSESSMENT = 'ASSESSMENT',
  MERIT = 'MERIT',
}

export interface ICredential {
  id: string;
  userId: string;
  programId: string;
  institutionId?: string;
  issuedById?: string;
  tier: CredentialTier;
  verificationCode: string;
  verificationUrl: string;
  verificationStatus: VerifyStatus;
  approvalStatus: ApprovalStatus;
  metadata?: string;
  hashSignature?: string;
  issuedAt: string;
  
  // Relations
  program?: any; // Replace with IProgram when available
  institution?: any;
  user?: any;
}

export interface CredentialTemplate {
    id: string;
    name: string;
    defaultTier?: CredentialTier;
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

export interface IGenerateProgramCredentialDto {
  userId: string;
  programId: string;
  tier: CredentialTier;
  issuedById?: string;
  metadata?: any;
}

export interface CreateCredentialDto {
  userId: string;
  programId: string;
  tier?: CredentialTier;
  templateId?: string;
}

export interface IGenerateAssessmentCredentialDto {
  userId: string;
  programId: string;
  assessmentId: string;
  tier: CredentialTier;
  issuedById?: string;
  metadata?: any;
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
