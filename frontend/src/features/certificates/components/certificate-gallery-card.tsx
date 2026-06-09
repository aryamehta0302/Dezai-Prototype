"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { Award, ExternalLink } from "lucide-react";
import { TIER_CONFIG } from "../types/certificate.types";
import { formatDate } from "@/shared/utils/format";
import type { MockCertificate } from "@/lib/mock-data/certificates";

interface CertificateGalleryCardProps {
  certificate: MockCertificate;
  className?: string;
}

export function CertificateGalleryCard({ certificate, className }: CertificateGalleryCardProps) {
  const tier = TIER_CONFIG[certificate.tier];

  return (
    <Link
      href={`/certificates/${certificate.id}`}
      className={cn(
        "group card-elevation flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Certificate Preview */}
      <div className={cn("relative h-40 flex items-center justify-center", tier.bgColor)}>
        <div className="text-center space-y-2">
          <Award className={cn("h-10 w-10 mx-auto", tier.color)} />
          <p className={cn("text-xs font-semibold uppercase tracking-wider", tier.color)}>
            {tier.label} Certificate
          </p>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="h-4 w-4 text-muted" />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2 flex-1">
        <h3 className="font-semibold text-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
          {certificate.courseTitle}
        </h3>
        <p className="text-xs text-muted">{certificate.universityName}</p>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-border-light">
          <span className="text-muted">{formatDate(certificate.issuedAt)}</span>
          <span className={cn("font-semibold", tier.color)}>
            {certificate.grade}
          </span>
        </div>
      </div>
    </Link>
  );
}
