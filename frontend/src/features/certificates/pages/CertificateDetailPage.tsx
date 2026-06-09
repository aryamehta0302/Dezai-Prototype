"use client";

import { PageContainer } from "@/shared/components/page-container";
import { EmptyState } from "@/shared/components/empty-state";
import { CertificatePreview } from "../components/certificate-preview";
import { CertificateQRCode } from "../components/certificate-qr-code";
import { certificateService } from "../services/certificate.service";
import { Button } from "@/shared/ui/button";
import { Award, Download, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CertificateDetailPageProps {
  id: string;
}

export function CertificateDetailPage({ id }: CertificateDetailPageProps) {
  const certificate = certificateService.getCertificate(id);

  if (!certificate) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          icon={Award}
          title="Certificate not found"
          description="This certificate doesn't exist or has been revoked."
        />
      </PageContainer>
    );
  }

  const handleDownload = () => {
    toast.success("Certificate PDF download started (demo)");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate — ${certificate.courseTitle}`,
        text: `I earned a certificate for ${certificate.courseTitle} on Dezai.ai!`,
        url: `https://dezai.ai/verify/${certificate.id}`,
      });
    } else {
      navigator.clipboard.writeText(`https://dezai.ai/verify/${certificate.id}`);
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
