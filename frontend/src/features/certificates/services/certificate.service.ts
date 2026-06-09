import {
  mockCertificates,
  getCertificatesByUser,
  getCertificateById,
  type MockCertificate,
} from "@/lib/mock-data/certificates";

export const certificateService = {
  getUserCertificates: (userId: string): MockCertificate[] => {
    return getCertificatesByUser(userId);
  },

  getCertificate: (certId: string): MockCertificate | undefined => {
    return getCertificateById(certId);
  },

  verify: (certId: string): { valid: boolean; certificate?: MockCertificate } => {
    const cert = getCertificateById(certId);
    if (!cert) return { valid: false };
    return { valid: true, certificate: cert };
  },

  getAll: (): MockCertificate[] => mockCertificates,
};
