import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { ApprovalStatus, VerifyStatus } from '@/features/credentials/types/credential.types';

interface CredentialStatusBadgeProps {
  approvalStatus: ApprovalStatus;
  verificationStatus: VerifyStatus;
  className?: string;
}

export function CredentialStatusBadge({ approvalStatus, verificationStatus, className }: CredentialStatusBadgeProps) {
  const baseClasses = `px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border ${className || ''}`;

  if (approvalStatus === ApprovalStatus.PENDING) {
    return <span className={`${baseClasses} bg-amber-500/10 text-amber-600 border-amber-500/20`}>Pending Approval</span>;
  }
  if (approvalStatus === ApprovalStatus.REJECTED) {
    return <span className={`${baseClasses} bg-destructive/10 text-destructive border-destructive/20`}>Rejected</span>;
  }

  // If approved, check verification status
  switch (verificationStatus) {
    case VerifyStatus.ACTIVE:
      return <span className={`${baseClasses} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`}>Active & Verified</span>;
    case VerifyStatus.SUSPENDED:
      return <span className={`${baseClasses} bg-orange-500/10 text-orange-600 border-orange-500/20`}>Suspended</span>;
    case VerifyStatus.REVOKED:
      return <span className={`${baseClasses} bg-destructive/10 text-destructive border-destructive/20`}>Revoked</span>;
    default:
      return <span className={`${baseClasses} bg-secondary/20 text-muted-foreground border-border`}>Unknown</span>;
  }
}
