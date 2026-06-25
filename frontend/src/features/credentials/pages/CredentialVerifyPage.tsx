"use client";

import { useState } from 'react';
import { PageContainer } from '@/shared/components/page-container';
import { EmptyState } from '@/shared/components/empty-state';
import { ShieldCheck, ShieldX, Loader2, Award, GraduationCap, AlertTriangle, Copy, Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/utils/format';
import { useCredentialVerify } from '../hooks/useCredentialVerify';
import { CredentialStatusBadge } from '../components/CredentialStatusBadge';
import { CREDENTIAL_TIER_CONFIG } from '../types/credential.types';

interface CredentialVerifyPageProps {
  id: string;
}

export function CredentialVerifyPage({ id }: CredentialVerifyPageProps) {
  const { credential, loading, error } = useCredentialVerify(id);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!credential) return;
    try {
      await navigator.clipboard.writeText(credential.verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const getStatusReason = (): string | null => {
    if (!credential?.metadata) return null;
    try {
      const meta = JSON.parse(credential.metadata as string);
      return meta.statusReason || null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted">Verifying credential…</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !credential) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          icon={ShieldX}
          title="Credential Not Found"
          description="This verification code could not be verified. The credential may not exist or has been revoked."
        />
      </PageContainer>
    );
  }

  const tierConfig = CREDENTIAL_TIER_CONFIG[credential.tier];
  const isActive = credential.verificationStatus === 'ACTIVE';

  return (
    <PageContainer className="py-10 space-y-8 max-w-3xl">
      {/* Verification Banner */}
      <div
        className={cn(
          'rounded-xl border p-6 flex items-center gap-4',
          isActive
            ? 'bg-success/10 border-success/20'
            : 'bg-warning/10 border-warning/20'
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            isActive ? 'bg-success/20' : 'bg-warning/20'
          )}
        >
          <ShieldCheck
            className={cn('h-6 w-6', isActive ? 'text-success' : 'text-warning')}
          />
        </div>
        <div>
          <h1
            className={cn(
              'text-lg font-bold',
              isActive ? 'text-success' : 'text-warning'
            )}
          >
            {isActive ? 'Credential Verified ✓' : `Credential ${credential.verificationStatus}`}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {isActive
              ? `This is an authentic Dezai.ai credential issued to ${credential.user?.name ?? 'Unknown'}.`
              : 'This credential is no longer active.'}
          </p>
        </div>
      </div>

      {/* Certificate Card */}
      <div
        className={cn(
          'relative rounded-xl border-2 bg-white p-8 md:p-12 text-center space-y-6 overflow-hidden',
          tierConfig.borderColor
        )}
      >
        {/* Decorative corners */}
        <div
          className="absolute top-0 left-0 h-20 w-20 border-t-4 border-l-4 rounded-tl-xl opacity-20"
          style={{ borderColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute bottom-0 right-0 h-20 w-20 border-b-4 border-r-4 rounded-br-xl opacity-20"
          style={{ borderColor: 'var(--color-primary)' }}
        />

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-on-surface">
              Dezai<span className="text-primary">.ai</span>
            </span>
          </div>
          <p className="text-xs text-muted uppercase tracking-[0.2em]">
            Verified Credential
          </p>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold',
              tierConfig.bgColor,
              tierConfig.color
            )}
          >
            <Award className="h-4 w-4" />
            {tierConfig.label} Tier
          </span>
        </div>

        {/* Recipient */}
        <div className="space-y-1">
          <p className="text-sm text-muted">This certifies that</p>
          <p className="text-2xl font-bold text-on-surface">
            {credential.user?.name ?? 'Unknown Recipient'}
          </p>
        </div>

        {/* Program */}
        <div className="space-y-1">
          <p className="text-sm text-muted">has successfully completed</p>
          <p className="text-xl font-semibold text-primary">
            {credential.program?.title ?? 'Unknown Program'}
          </p>
          <p className="text-sm text-on-surface-variant">
            offered by {credential.institution?.name ?? 'Unknown Institution'}
          </p>
        </div>

        {/* Status & Date */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="text-center">
            <CredentialStatusBadge status={credential.verificationStatus} />
            <p className="text-xs text-muted mt-1">Status</p>
          </div>
          <div className="h-8 w-px bg-border-light" />
          <div className="text-center">
            <p className="text-sm font-medium text-on-surface">
              {formatDate(credential.issuedAt)}
            </p>
            <p className="text-xs text-muted">Issued</p>
          </div>
          {credential.issuer?.name && (
            <>
              <div className="h-8 w-px bg-border-light" />
              <div className="text-center">
                <p className="text-sm font-medium text-on-surface">{credential.issuer.name}</p>
                <p className="text-xs text-muted">Issuer</p>
              </div>
            </>
          )}
        </div>

        {/* Revocation / Suspension Reason */}
        {!isActive && getStatusReason() && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Reason</span>
            </div>
            <p className="text-sm text-amber-800">{getStatusReason()}</p>
          </div>
        )}

        {/* Verification Code with Copy */}
        <div className="pt-4 border-t border-border-light">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted">
                Verification Code:{' '}
                <span className="font-mono font-semibold">{credential.verificationCode}</span>
              </p>
              <p className="text-xs text-muted mt-1">
                Verify at dezai.io/verify/{credential.verificationCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0',
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-border-light hover:bg-neutral-50 text-on-surface'
              )}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
