"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { credentialsService } from "@/features/credentials/services/credentials.service";
import { mapCredentialToCertificate } from "@/features/credentials/utils/mapping";
import type { MockCertificate } from "@/lib/mock-data/certificates";

export function useCertificates() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<MockCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchCertificates = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await credentialsService.getStudentCredentials();
      setCertificates(data.map(mapCredentialToCertificate));
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  return { certificates, loading, error, refetch: fetchCertificates };
}
