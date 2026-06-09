"use client";

import { PageContainer } from "@/shared/components/page-container";
import { CertificatePreview } from "../components/certificate-preview";
import { CertificateQRCode } from "../components/certificate-qr-code";
import { certificateService } from "../services/certificate.service";
import { EmptyState } from "@/shared/components/empty-state";
import { ShieldCheck, ShieldX } from "lucide-react";

interface VerifyPageProps {
  id: string;
}

export function VerifyPage({ id }: VerifyPageProps) {
  const { valid, certificate } = certificateService.verify(id);

  if (!valid || !certificate) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          icon={ShieldX}
          title="Certificate Not Found"
          description="This certificate ID could not be verified. It may not exist or has been revoked."
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
