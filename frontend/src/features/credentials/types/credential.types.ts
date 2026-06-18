// CredentialTier maps to Prisma enum
export type CredentialTier = 'FORGE' | 'ARENA' | 'CITADEL';

// VerifyStatus maps to Prisma enum
export type VerifyStatus = 'ACTIVE' | 'REVOKED' | 'SUSPENDED';

// Full credential from API (with nested relations)
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
  metadata: string | null;
  issuedAt: string;
  user?: { id: string; name: string | null; email: string };
  program?: { id: string; title: string; description: string };
  institution?: { id: string; name: string; logoUrl: string | null };
  issuer?: { id: string; name: string | null; email: string };
}

// Public credential returned from verify endpoint (sanitized)
export interface PublicCredential {
  id: string;
  tier: CredentialTier;
  verificationCode: string;
  verificationUrl: string;
  verificationStatus: VerifyStatus;
  issuedAt: string;
  metadata: string | null;
  user: { name: string | null };
  program: { title: string; description: string };
  institution: { name: string; logoUrl: string | null };
}

// Tier display configuration
export interface TierDisplayInfo {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CREDENTIAL_TIER_CONFIG: Record<CredentialTier, TierDisplayInfo> = {
  FORGE: {
    label: 'Forge',
    description: 'Foundational skill verification',
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
  },
  ARENA: {
    label: 'Arena',
    description: 'Competitive academic credential',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
  CITADEL: {
    label: 'Citadel',
    description: 'Professional industry-verified credential',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
};
