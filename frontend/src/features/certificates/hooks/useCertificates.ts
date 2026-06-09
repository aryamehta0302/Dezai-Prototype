"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { certificateService } from "../services/certificate.service";

export function useCertificates() {
  const { user } = useAuthStore();

  const certificates = useMemo(
    () => (user ? certificateService.getUserCertificates(user.id) : []),
    [user]
  );

  return { certificates };
}
