/**
 * @module features/certificates
 * Certificate management, display & verification feature.
 */

export { CertificateGalleryCard } from "./components/certificate-gallery-card";
export { CertificateTierCard, CertificateTierCards } from "./components/certificate-tier-card";
export { CertificatePreview } from "./components/certificate-preview";
export { CertificateQRCode } from "./components/certificate-qr-code";

export { useCertificates } from "./hooks/useCertificates";
export { certificateService } from "./services/certificate.service";

export { CertificateListPage } from "./pages/CertificateListPage";
export { CertificateDetailPage } from "./pages/CertificateDetailPage";
export { VerifyPage } from "./pages/VerifyPage";

export { TIER_CONFIG } from "./types/certificate.types";
export type { TierInfo } from "./types/certificate.types";
