"use client";

import { cn } from '@/shared/utils/cn';
import type { VerifyStatus } from '../types/credential.types';

const STATUS_STYLES: Record<VerifyStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20',
  },
  REVOKED: {
    label: 'Revoked',
    className: 'bg-error/10 text-error border-error/20',
  },
  SUSPENDED: {
    label: 'Suspended',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
};

interface CredentialStatusBadgeProps {
  status: VerifyStatus;
  className?: string;
}

export function CredentialStatusBadge({ status, className }: CredentialStatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}
