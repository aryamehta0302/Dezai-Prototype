"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/shared/components/page-container";
import { EmptyState } from "@/shared/components/empty-state";
import { CertificatePreview } from "../components/certificate-preview";
import { CertificateQRCode } from "../components/certificate-qr-code";
import { Button } from "@/shared/ui/button";
import { Award, Download, ArrowLeft, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { credentialsService } from "@/features/credentials/services/credentials.service";
import { mapCredentialToCertificate } from "@/features/credentials/utils/mapping";
import { downloadCertificatePDF } from "../utils/pdf";
import type { MockCertificate } from "@/lib/mock-data/certificates";

interface CertificateDetailPageProps {
  id: string;
}

export function CertificateDetailPage({ id }: CertificateDetailPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [certificate, setCertificate] = useState<MockCertificate | null>(null);

  useEffect(() => {
    async function loadCredential() {
      try {
        setLoading(true);
        setError(false);
        // id here can be the verification code or database ID
        const cred = await credentialsService.getCredentialDetails(id);
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
        <p className="text-on-surface-variant text-sm">Loading certificate ledger...</p>
      </PageContainer>
    );
  }

  if (error || !certificate) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          icon={Award}
          title="Certificate not found"
          description="This certificate doesn't exist on the Dezai ledger or has been revoked."
        />
      </PageContainer>
    );
  }

  const handleDownload = () => {
    try {
      downloadCertificatePDF(certificate);
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate certificate PDF.");
    }
  };

  const handleShare = () => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Dezai Certificate — ${certificate.courseTitle}`,
        text: `I earned a certificate for ${certificate.courseTitle} on Dezai.ai!`,
        url: verifyUrl,
      });
    } else {
      navigator.clipboard.writeText(verifyUrl);
      toast.success("Verification link copied to clipboard!");
    }
  };

  return (
    <PageContainer className="py-8 space-y-8 max-w-4xl">
      {/* Back */}
      <Link
        href="/certificates"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to certificates
      </Link>

      {/* Certificate Preview */}
      <CertificatePreview certificate={certificate} />

      {/* Actions & QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions */}
        <div className="card-elevation p-6 space-y-4">
          <h3 className="font-semibold text-on-surface">Actions</h3>
          <div className="space-y-3">
            <Button className="w-full gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share Certificate
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="card-elevation p-6 flex flex-col items-center justify-center">
          <CertificateQRCode certificateId={certificate.id} />
        </div>
      </div>
    </PageContainer>
  );
}
