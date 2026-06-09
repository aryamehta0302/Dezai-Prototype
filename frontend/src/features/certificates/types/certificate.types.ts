import { CertificateTier } from "@/shared/types/common.types";

export interface TierInfo {
  tier: CertificateTier;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const TIER_CONFIG: Record<CertificateTier, TierInfo> = {
  [CertificateTier.TIER_1]: {
    tier: CertificateTier.TIER_1,
    label: "Foundational",
    description: "Dezai Core — demonstrates fundamental understanding",
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
  },
  [CertificateTier.TIER_2]: {
    tier: CertificateTier.TIER_2,
    label: "Academic",
    description: "University Accredited — recognized academic credential",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
  },
  [CertificateTier.TIER_3]: {
    tier: CertificateTier.TIER_3,
    label: "Professional",
    description: "Industry Verified — validated by industry partners",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
  },
};
