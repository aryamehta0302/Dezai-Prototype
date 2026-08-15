"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { useCredentials } from "@/features/credentials/hooks/useCredentials";
import { CredentialStatusBadge } from "@/features/credentials/components/CredentialStatusBadge";
import { CREDENTIAL_TIER_CONFIG } from "@/features/credentials/types/credential.types";
import { cn } from "@/shared/utils/cn";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";

export function CredentialWidget() {
  const { credentials, loading, error } = useCredentials();

  if (loading) {
    return <LoadingSkeleton className="h-36 rounded-xl" />;
  }

  if (error || credentials.length === 0) {
    return null;
  }

  const latest = credentials[0];
  const tierConfig = latest
    ? CREDENTIAL_TIER_CONFIG[latest.tier]
    : undefined;

  return (
    <div className="card-elevation p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
          Credentials
        </h3>
        <Link
          href="/certificates"
          className="text-xs text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {latest && tierConfig && (
        <div
          className={cn(
            "rounded-lg border p-4 space-y-2",
            tierConfig.borderColor
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                tierConfig.bgColor,
                tierConfig.color
              )}
            >
              <Award className="h-3 w-3" />
              {tierConfig.label}
            </span>
            <CredentialStatusBadge status={latest.verificationStatus} />
          </div>
          <p className="text-sm font-medium text-on-surface truncate">
            {latest.program?.title ?? "Unknown Program"}
          </p>
          <p className="text-xs text-muted">
            {latest.institution?.name ?? "Unknown Institution"}
          </p>
        </div>
      )}

      {credentials.length > 1 && (
        <p className="text-xs text-muted text-center">
          +{credentials.length - 1} more credential
          {credentials.length - 1 > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
