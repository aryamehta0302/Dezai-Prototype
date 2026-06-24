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

export interface IGenerateProgramCredentialDto {
  userId: string;
  programId: string;
  tier: CredentialTier;
  issuedById?: string;
  metadata?: any;
}

export interface IGenerateAssessmentCredentialDto {
  userId: string;
  programId: string;
  assessmentId: string;
  tier: CredentialTier;
  issuedById?: string;
  metadata?: any;
}
