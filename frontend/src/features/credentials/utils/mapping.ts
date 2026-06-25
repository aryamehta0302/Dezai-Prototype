import { CertificateTier } from "@/shared/types/common.types";
import { CredentialResponse } from "../types/credentials.types";
import { MockCertificate } from "@/lib/mock-data/certificates";

export function mapCredentialToCertificate(cred: CredentialResponse): MockCertificate {
  let metadataParsed = { score: 100, grade: "A", instructorName: "Dezai Faculty" };
  if (cred.metadata) {
    try {
      metadataParsed = JSON.parse(cred.metadata);
    } catch (e) {
      console.error(e);
    }
  }

  let mappedTier = CertificateTier.TIER_1;
  if (cred.tier === "ARENA") {
    mappedTier = CertificateTier.TIER_2;
  } else if (cred.tier === "CITADEL") {
    mappedTier = CertificateTier.TIER_3;
  }

  return {
    id: cred.verificationCode,
    verifyId: cred.verificationCode,
    userId: cred.userId,
    userName: cred.user.name || "Student",
    courseId: cred.programId,
    courseTitle: cred.program.title,
    universityId: cred.institutionId,
    universityName: cred.program.institution.name,
    instructorName: metadataParsed.instructorName,
    tier: mappedTier,
    grade: metadataParsed.grade,
    score: metadataParsed.score,
    issuedAt: cred.issuedAt,
    credentialId: cred.id,
  };
}
