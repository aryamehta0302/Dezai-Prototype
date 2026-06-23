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

  useEffect(() => {
    async function loadCredential() {
      try {
        setLoading(true);
        setError(false);
        const cred = await credentialsService.verifyCredential(id);
        if (cred) {
          setCertificate(mapCredentialToCertificate(cred));
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
      {/* Verified Banner */}
      <div className="rounded-xl bg-success/10 border border-success/20 p-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
          <ShieldCheck className="h-6 w-6 text-success" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-success">Certificate Verified ✓</h1>
          <p className="text-sm text-on-surface-variant">
            This is an authentic Dezai.ai certificate issued to {certificate.userName}.
          </p>
        </div>
      </div>

      {/* Certificate Preview */}
      <CertificatePreview certificate={certificate} />

      {/* QR */}
      <div className="flex justify-center">
        <CertificateQRCode certificateId={certificate.id} />
      </div>
    </PageContainer>
  );
}
