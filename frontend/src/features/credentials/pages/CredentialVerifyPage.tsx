"use client";

import { useState } from 'react';
import { PageContainer } from '@/shared/components/page-container';
import { EmptyState } from '@/shared/components/empty-state';
import { 
  ShieldCheck, ShieldX, Loader2, Award, GraduationCap, 
  AlertTriangle, Copy, Check, Printer, ShieldAlert, User, Building2 
} from 'lucide-react';
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
      <PageContainer className="py-16 print:hidden">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted">Verifying credential…</p>
        </div>
      </PageContainer>
    );
  }

  // If there is no credential data and we have an error, the code is completely invalid (not found)
  if (!credential && error) {
    return (
      <PageContainer className="py-16 print:hidden">
        <EmptyState
          icon={ShieldX}
          title="Credential Not Found"
          description={error || "This verification code could not be verified. The credential may not exist."}
        />
      </PageContainer>
    );
  }

  const isRevoked = credential?.verificationStatus === 'REVOKED';
  const isTampered = error?.includes('tampering');
  const isActive = credential?.verificationStatus === 'ACTIVE' && !isTampered;
  const tierConfig = credential ? CREDENTIAL_TIER_CONFIG[credential.tier] : null;

  return (
    <PageContainer className="py-10 space-y-8 max-w-3xl print:p-0 print:max-w-4xl print:w-full print:bg-white print:space-y-0">
      {/* Verification Banner */}
      <div
        className={cn(
          'rounded-xl border p-6 flex items-center gap-4 print:hidden',
          isActive
            ? 'bg-success/10 border-success/20'
            : 'bg-warning/10 border-warning/20'
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shrink-0',
            isActive ? 'bg-success/20' : 'bg-warning/20'
          )}
        >
          {isActive ? (
            <ShieldCheck className="h-6 w-6 text-success" />
          ) : (
            <ShieldAlert className="h-6 w-6 text-warning" />
          )}
        </div>
        <div>
          <h1
            className={cn(
              'text-lg font-bold',
              isActive ? 'text-success' : 'text-warning'
            )}
          >
            {isTampered 
              ? 'CRITICAL SECURITY BREACH' 
              : isRevoked 
                ? 'Credential Revoked' 
                : isActive 
                  ? 'Credential Verified ✓' 
                  : `Credential ${credential?.verificationStatus}`}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {isTampered
              ? 'Security Alert: This credential metadata has been tampered with or corrupted!'
              : isRevoked
                ? 'This credential has been permanently revoked and is no longer valid.'
                : isActive
                  ? `This is an authentic Dezai.ai credential issued to ${credential?.user?.name ?? 'Unknown'}.`
                  : 'This credential is under suspension or review.'}
          </p>
        </div>
      </div>

      {credential && tierConfig && (
        isRevoked || isTampered ? (
          /* Premium Revoked / Tampered State Card */
          <div className="relative rounded-xl border-2 border-red-500/30 bg-white p-8 md:p-12 text-center space-y-6 overflow-hidden print:shadow-none print:border-none print:w-full print:mx-auto">
            {/* Diagonal Watermark Overlays */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03] flex flex-col justify-between py-16 overflow-hidden rotate-[-15deg]">
              <div className="text-red-600 text-6xl font-black tracking-widest text-center">REVOKED</div>
              <div className="text-red-600 text-6xl font-black tracking-widest text-center">INVALID</div>
              <div className="text-red-600 text-6xl font-black tracking-widest text-center">REVOKED</div>
            </div>

            <div 
              className="absolute top-0 left-0 w-full p-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest text-center relative z-10 animate-pulse"
              style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              {isTampered ? 'SECURITY ALERT: TAMPERING DETECTED' : 'INVALIDATED CREDENTIAL'}
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-4 border-2 border-red-500">
              <ShieldAlert className="h-9 w-9 text-red-600" />
            </div>

            <h2 className="text-2xl font-black text-red-600 mb-2">
              {isTampered ? 'CRITICAL SECURITY BREACH' : 'Credential Revoked'}
            </h2>
            <p className="text-muted text-sm max-w-md mx-auto">
              {isTampered 
                ? 'The cryptographic signature validation failed. This record has been modified outside the authorized network.'
                : 'This credential was revoked by the issuing institution and is permanently invalid.'}
            </p>

            {/* Warning details card */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>Revocation Audit Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-red-100 pt-3">
                <div>
                  <p className="text-muted font-semibold">Verification Status</p>
                  <p className="font-bold text-red-600">
                    {isTampered ? 'TAMPERED / CORRUPTED' : 'PERMANENTLY REVOKED'}
                  </p>
                </div>
                <div>
                  <p className="text-muted font-semibold">Updated On</p>
                  <p className="font-medium text-on-surface">
                    {(() => {
                      try {
                        const meta = JSON.parse(credential.metadata || '');
                        return meta.statusLastChangedAt ? formatDate(meta.statusLastChangedAt) : 'Unknown';
                      } catch {
                        return 'Unknown';
                      }
                    })()}
                  </p>
                </div>
                {getStatusReason() && (
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-muted font-semibold">Reason</p>
                    <p className="font-medium text-red-700 italic bg-white border border-red-100 px-3 py-2 rounded-lg mt-1">
                      "{getStatusReason()}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Attempted Recipient Details in Disabled Look */}
            <div className="border border-border-light rounded-xl p-4 bg-neutral-50/50 text-left space-y-2 opacity-50">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Attempted Recipient Details</p>
              <div className="text-sm border-t border-border-light pt-2 space-y-1">
                <p className="text-on-surface">
                  Recipient: <span className="font-bold line-through">{credential.user?.name || credential.userId}</span>
                </p>
                <p className="text-on-surface">
                  Program: <span className="font-medium line-through">{credential.program?.title || 'Unknown Program'}</span>
                </p>
                <p className="text-on-surface">
                  Institution: <span className="font-medium">{credential.institution?.name || 'Unknown Institution'}</span>
                </p>
                <p className="text-xs text-muted font-mono bg-neutral-100 p-2 rounded-md mt-2">
                  Code: {credential.verificationCode}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-2 print:hidden items-center">
              <button onClick={() => window.location.href = '/'} className="px-6 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                Return Home
              </button>
            </div>
          </div>
        ) : (
          /* Active Certificate Card */
          <div
            className={cn(
              'relative rounded-xl border-2 bg-white p-8 md:p-12 text-center space-y-6 overflow-hidden print:shadow-none print:border-none print:w-full print:mx-auto',
              tierConfig.borderColor
            )}
          >
            {/* Decorative corners */}
            <div
              className="absolute top-0 left-0 h-20 w-20 border-t-4 border-l-4 rounded-tl-xl opacity-20 print:hidden"
              style={{ borderColor: 'var(--color-primary)' }}
            />
            <div
              className="absolute bottom-0 right-0 h-20 w-20 border-b-4 border-r-4 rounded-br-xl opacity-20 print:hidden"
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
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
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

            {/* Verification Code with Copy & Print */}
            <div className="pt-4 border-t border-border-light print:border-none">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                <div className="text-left">
                  <p className="text-xs text-muted">
                    Verification Code:{' '}
                    <span className="font-mono font-semibold">{credential.verificationCode}</span>
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Verify at dezai.io/verify/{credential.verificationCode}
                  </p>
                </div>
                
                <div className="flex gap-2">
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

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all shrink-0"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </button>
                </div>
              </div>
              
              {/* Printed code info */}
              <div className="hidden print:block text-center text-xs text-muted mt-4 font-mono">
                Verification Code: {credential.verificationCode} | Verify at dezai.io/verify/{credential.verificationCode}
              </div>
            </div>
          </div>
        )
      )}
    </PageContainer>
  );
}
