"use client";

import { cn } from "@/shared/utils/cn";
import { Award, CheckCircle } from "lucide-react";
import { TIER_CONFIG, type TierInfo } from "../types/certificate.types";
import { CertificateTier } from "@/shared/types/common.types";

export function CertificateTierCard({ tier }: { tier: TierInfo }) {
  return (
    <div className={cn("rounded-xl border p-5 space-y-3", tier.borderColor, tier.bgColor)}>
      <div className="flex items-center gap-3">
        <Award className={cn("h-6 w-6", tier.color)} />
        <div>
          <h3 className={cn("font-semibold", tier.color)}>Tier {tier.tier.split("_")[1]}</h3>
          <p className="text-sm font-medium text-on-surface">{tier.label}</p>
        </div>
      </div>
      <p className="text-sm text-on-surface-variant">{tier.description}</p>
    </div>
  );
}

export function CertificateTierCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.values(TIER_CONFIG).map((tier) => (
        <CertificateTierCard key={tier.tier} tier={tier} />
      ))}
    </div>
  );
}
