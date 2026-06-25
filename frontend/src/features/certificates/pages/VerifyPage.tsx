"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/shared/components/page-container";
import { CertificatePreview } from "../components/certificate-preview";
import { CertificateQRCode } from "../components/certificate-qr-code";
import { EmptyState } from "@/shared/components/empty-state";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { credentialsService } from "@/features/credentials/services/credentials.service";
import { mapCredentialToCertificate } from "@/features/credentials/utils/mapping";
import type { MockCertificate } from "@/lib/mock-data/certificates";

interface VerifyPageProps {
  id: string;
}

export function VerifyPage({ id }: VerifyPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [certificate, setCertificate] = useState<MockCertificate | null>(null);
  const [status, setStatus] = useState<string>('ACTIVE');
  const [statusReason, setStatusReason] = useState<string>('');
  const [statusDate, setStatusDate] = useState<string>('');

  useEffect(() => {
    async function loadCredential() {
      try {
        setLoading(true);
        setError(false);
        const cred = await credentialsService.verifyCredential(id);
        if (cred) {
          setCertificate(mapCredentialToCertificate(cred));
          setStatus(cred.verificationStatus || 'ACTIVE');
          
          let reason = '';
          let lastChanged = '';
          if (cred.metadata) {
            try {
              const meta = JSON.parse(cred.metadata);
              reason = meta.statusReason || '';
              lastChanged = meta.statusLastChangedAt || '';
            } catch (e) {}
          }
          setStatusReason(reason);
          setStatusDate(lastChanged);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCredential();
    }
  }, [id]);

  if (loading) {
    return (
      <PageContainer className="py-16 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-on-surface-variant text-sm">Verifying credential ledger...</p>
      </PageContainer>
    );
  }

  if (error || !certificate) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          icon={ShieldX}
          title="Certificate Not Found"
          description="This certificate ID could not be verified on the Dezai ledger. It may not exist or has been revoked."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 space-y-8 max-w-3xl">
      {/* Warning/Success Banners */}
      {status === 'ACTIVE' && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-emerald-600">Certificate Verified ✓</h1>
            <p className="text-sm text-on-surface-variant">
              This is an authentic Dezai.ai certificate issued to <strong>{certificate.userName}</strong>.
            </p>
          </div>
        </div>
      )}

      {status === 'SUSPENDED' && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 shrink-0">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-amber-600">Credential Under Review (Suspended) ⚠</h1>
            <p className="text-sm text-on-surface-variant">
              This credential was issued to <strong>{certificate.userName}</strong> but is currently suspended/under review.
            </p>
            {statusReason && (
              <p className="text-xs text-amber-800 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 font-medium">
                <strong>Reason:</strong> {statusReason}
              </p>
            )}
            {statusDate && (
              <p className="text-[10px] text-muted-foreground">
                Suspended on {new Date(statusDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {status === 'REVOKED' && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 shrink-0">
            <ShieldX className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-red-600">Credential Permanently Revoked ❌</h1>
            <p className="text-sm text-on-surface-variant">
              This credential issued to <strong>{certificate.userName}</strong> has been revoked and is no longer valid.
            </p>
            {statusReason && (
              <p className="text-xs text-red-800 bg-red-500/5 p-3 rounded-lg border border-red-500/10 font-medium">
                <strong>Reason for Revocation:</strong> {statusReason}
              </p>
            )}
            {statusDate && (
              <p className="text-[10px] text-muted-foreground">
                Revoked on {new Date(statusDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Certificate Preview with Watermark Stamp */}
      <div className="relative">
        {status === 'SUSPENDED' && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none z-10 flex items-center justify-center select-none overflow-hidden rounded-2xl border border-dashed border-amber-500/30">
            <div className="rotate-[-12deg] text-6xl font-black uppercase text-amber-500/25 border-8 border-dashed border-amber-500/25 px-8 py-4 rounded-3xl tracking-widest">
              Suspended
            </div>
          </div>
        )}
        {status === 'REVOKED' && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none z-10 flex items-center justify-center select-none overflow-hidden rounded-2xl border border-dashed border-red-500/30">
            <div className="rotate-[-12deg] text-6xl font-black uppercase text-red-500/25 border-8 border-dashed border-red-500/25 px-8 py-4 rounded-3xl tracking-widest">
              Revoked
            </div>
          </div>
        )}
        <CertificatePreview certificate={certificate} />
      </div>

      {/* QR */}
      <div className="flex justify-center">
        <CertificateQRCode certificateId={certificate.id} />
      </div>
    </PageContainer>
  );
}
