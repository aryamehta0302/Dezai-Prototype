import { CertificateTier } from "@/shared/types/common.types";

export type CredentialVerifyStatus = "ACTIVE" | "REVOKED" | "SUSPENDED";

export interface CredentialMetadata {
  score: number;
  grade: string;
  instructorName: string;
}

export interface CredentialResponse {
  id: string;
  userId: string;
  programId: string;
  institutionId: string;
  issuedById: string;
  tier: "FORGE" | "ARENA" | "CITADEL";
  verificationCode: string;
  verificationUrl: string;
  verificationStatus: CredentialVerifyStatus;
  metadata: string; // JSON string
  issuedAt: string;
  program: {
    id: string;
    title: string;
    description: string;
    institution: {
      id: string;
      name: string;
      logoUrl?: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  issuer: {
    id: string;
    name: string;
  };
}
