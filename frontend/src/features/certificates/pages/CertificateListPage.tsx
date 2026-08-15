"use client";

import { PageContainer } from "@/shared/components/page-container";
import { EmptyState } from "@/shared/components/empty-state";
import { CertificateGalleryCard } from "../components/certificate-gallery-card";
import { CertificateTierCards } from "../components/certificate-tier-card";
import { useCertificates } from "../hooks/useCertificates";
import { Award, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function CertificateListPage() {
  const { certificates, loading } = useCertificates();

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">My Certificates</h1>
        <p className="text-muted mt-1">
          Your earned credentials and certifications
        </p>
      </div>

      {/* Tier Info */}
      <CertificateTierCards />

      {/* Gallery */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm">Loading credentials from ledger...</p>
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 fade-in-staggered">
          {certificates.map((cert) => (
            <CertificateGalleryCard key={cert.id} certificate={cert} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete courses and pass assessments to earn certificates."
          action={
            <Link href="/catalog">
              <Button>Browse Courses</Button>
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
