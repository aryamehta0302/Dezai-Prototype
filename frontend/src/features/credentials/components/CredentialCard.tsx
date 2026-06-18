"use client";

import { cn } from '@/shared/utils/cn';
import { Award } from 'lucide-react';
import { formatDate } from '@/shared/utils/format';
import { CredentialStatusBadge } from './CredentialStatusBadge';
import { CREDENTIAL_TIER_CONFIG } from '../types/credential.types';
import type { Credential } from '../types/credential.types';

interface CredentialCardProps {
  credential: Credential;
  className?: string;
}

export function CredentialCard({ credential, className }: CredentialCardProps) {
  const tierConfig = CREDENTIAL_TIER_CONFIG[credential.tier];

  return (
    <div
      className={cn(
        'rounded-xl border p-5 space-y-4 bg-surface transition-shadow hover:shadow-md',
        tierConfig.borderColor,
        className
      )}
    >
      {/* Header: Tier + Status */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            tierConfig.bgColor,
            tierConfig.color
          )}
        >
          <Award className="h-3.5 w-3.5" />
          {tierConfig.label}
        </span>
        <CredentialStatusBadge status={credential.verificationStatus} />
      </div>

      {/* Program & Institution */}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-on-surface">
          {credential.program?.title ?? 'Unknown Program'}
        </h3>
        <p className="text-sm text-on-surface-variant">
          {credential.institution?.name ?? 'Unknown Institution'}
        </p>
      </div>

      {/* Footer: Date & Code */}
      <div className="flex items-center justify-between pt-2 border-t border-border-light">
        <p className="text-xs text-muted">
          Issued {formatDate(credential.issuedAt)}
        </p>
        <p className="text-xs font-mono text-muted">
          {credential.verificationCode}
        </p>
      </div>
    </div>
  );
}
