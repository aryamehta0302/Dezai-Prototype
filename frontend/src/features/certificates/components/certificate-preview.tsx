"use client";

import { cn } from "@/shared/utils/cn";
import { Award, GraduationCap } from "lucide-react";
import { TIER_CONFIG } from "../types/certificate.types";
import { formatDate } from "@/shared/utils/format";
import type { MockCertificate } from "@/lib/mock-data/certificates";

interface CertificatePreviewProps {
  certificate: MockCertificate;
  className?: string;
}

export function CertificatePreview({ certificate, className }: CertificatePreviewProps) {
  const tier = TIER_CONFIG[certificate.tier];

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 bg-white p-8 md:p-12 text-center space-y-6 overflow-hidden",
        tier.borderColor,
        className
      )}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 h-20 w-20 border-t-4 border-l-4 rounded-tl-xl opacity-20" style={{ borderColor: "var(--color-primary)" }} />
      <div className="absolute bottom-0 right-0 h-20 w-20 border-b-4 border-r-4 rounded-br-xl opacity-20" style={{ borderColor: "var(--color-primary)" }} />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-on-surface">
            Dezai<span className="text-primary">.ai</span>
          </span>
        </div>
        <p className="text-xs text-muted uppercase tracking-[0.2em]">Certificate of Completion</p>
      </div>

      {/* Tier Badge */}
      <div className="flex justify-center">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold", tier.bgColor, tier.color)}>
          <Award className="h-4 w-4" />
          {tier.label} — Tier {certificate.tier.split("_")[1]}
        </span>
      </div>

      {/* Recipient */}
      <div className="space-y-1">
        <p className="text-sm text-muted">This certifies that</p>
        <p className="text-2xl font-bold text-on-surface">{certificate.userName}</p>
      </div>

      {/* Course */}
      <div className="space-y-1">
        <p className="text-sm text-muted">has successfully completed</p>
        <p className="text-xl font-semibold text-primary">{certificate.courseTitle}</p>
        <p className="text-sm text-on-surface-variant">
          offered by {certificate.universityName}
        </p>
      </div>

      {/* Score & Date */}
      <div className="flex items-center justify-center gap-8 pt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-on-surface">{certificate.grade}</p>
          <p className="text-xs text-muted">Grade</p>
        </div>
        <div className="h-8 w-px bg-border-light" />
        <div className="text-center">
          <p className="text-2xl font-bold text-on-surface">{certificate.score}%</p>
          <p className="text-xs text-muted">Score</p>
        </div>
        <div className="h-8 w-px bg-border-light" />
        <div className="text-center">
          <p className="text-sm font-medium text-on-surface">{formatDate(certificate.issuedAt)}</p>
          <p className="text-xs text-muted">Issued</p>
        </div>
      </div>

      {/* Certificate ID */}
      <div className="pt-4 border-t border-border-light">
        <p className="text-xs text-muted">
          Certificate ID: <span className="font-mono">{certificate.id}</span>
        </p>
        <p className="text-xs text-muted mt-1">
          Verify at dezai.ai/verify/{certificate.id}
        </p>
      </div>
    </div>
  );
}
