import { CertificateTier } from "@/shared/types/common.types";

export interface MockCertificate {
  id: string;
  verifyId: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  universityId: string;
  universityName: string;
  instructorName: string;
  tier: CertificateTier;
  grade: string;
  score: number;
  issuedAt: string;
  expiresAt?: string;
  credentialId: string;
}

export const mockCertificates: MockCertificate[] = [
  {
    id: "cert-1", verifyId: "DZA-2026-KPGU-00142", userId: "user-student-1",
    userName: "Aarav Patel", courseId: "course-4", courseTitle: "AI Ethics & Governance",
    universityId: "kpgu", universityName: "KPGU", instructorName: "Dr. Neel Trivedi",
    tier: CertificateTier.TIER_1, grade: "A+", score: 95, issuedAt: "2026-02-15",
    credentialId: "CR-2026-00142",
  },
  {
    id: "cert-2", verifyId: "DZA-2026-MSU-00087", userId: "user-student-1",
    userName: "Aarav Patel", courseId: "course-10", courseTitle: "Design Thinking for Innovation",
    universityId: "msu", universityName: "MSU Baroda", instructorName: "Dr. Arjun Nair",
    tier: CertificateTier.TIER_1, grade: "A", score: 88, issuedAt: "2026-03-20",
    credentialId: "CR-2026-00087",
  },
  {
    id: "cert-3", verifyId: "DZA-2026-KPGU-00198", userId: "user-student-2",
    userName: "Ishaan Shah", courseId: "course-4", courseTitle: "AI Ethics & Governance",
    universityId: "kpgu", universityName: "KPGU", instructorName: "Dr. Neel Trivedi",
    tier: CertificateTier.TIER_1, grade: "B+", score: 82, issuedAt: "2026-04-10",
    credentialId: "CR-2026-00198",
  },
  {
    id: "cert-4", verifyId: "DZA-2026-CHRT-00056", userId: "user-student-3",
    userName: "Priya Sharma", courseId: "course-7", courseTitle: "E-Commerce Operations & Management",
    universityId: "charusat", universityName: "CHARUSAT", instructorName: "Dr. Meera Krishnan",
    tier: CertificateTier.TIER_1, grade: "A", score: 91, issuedAt: "2026-01-28",
    credentialId: "CR-2026-00056",
  },
  {
    id: "cert-5", verifyId: "DZA-2026-PARL-00234", userId: "user-student-3",
    userName: "Priya Sharma", courseId: "course-8", courseTitle: "Business Analytics & Decision Making",
    universityId: "parul", universityName: "Parul University", instructorName: "Prof. Sneha Raval",
    tier: CertificateTier.TIER_2, grade: "A+", score: 94, issuedAt: "2026-05-05",
    credentialId: "CR-2026-00234",
  },
  {
    id: "cert-6", verifyId: "DZA-2026-KPGU-00312", userId: "user-student-4",
    userName: "Arjun Mehta", courseId: "course-2", courseTitle: "Machine Learning Fundamentals",
    universityId: "kpgu", universityName: "KPGU", instructorName: "Dr. Rajesh Patel",
    tier: CertificateTier.TIER_2, grade: "A", score: 89, issuedAt: "2026-04-22",
    credentialId: "CR-2026-00312",
  },
  {
    id: "cert-7", verifyId: "DZA-2025-NAVR-00078", userId: "user-student-5",
    userName: "Kavya Joshi", courseId: "course-10", courseTitle: "Design Thinking for Innovation",
    universityId: "navrachana", universityName: "Navrachana University", instructorName: "Dr. Arjun Nair",
    tier: CertificateTier.TIER_1, grade: "A+", score: 97, issuedAt: "2025-12-15",
    credentialId: "CR-2025-00078",
  },
  {
    id: "cert-8", verifyId: "DZA-2026-NAVR-00091", userId: "user-student-5",
    userName: "Kavya Joshi", courseId: "course-11", courseTitle: "Visual Communication & Storytelling",
    universityId: "navrachana", universityName: "Navrachana University", instructorName: "Prof. Ananya Desai",
    tier: CertificateTier.TIER_1, grade: "A", score: 90, issuedAt: "2026-02-28",
    credentialId: "CR-2026-00091",
  },
  {
    id: "cert-9", verifyId: "DZA-2026-CHRT-00103", userId: "user-student-6",
    userName: "Rohan Desai", courseId: "course-7", courseTitle: "E-Commerce Operations & Management",
    universityId: "charusat", universityName: "CHARUSAT", instructorName: "Dr. Meera Krishnan",
    tier: CertificateTier.TIER_1, grade: "B+", score: 84, issuedAt: "2026-03-15",
    credentialId: "CR-2026-00103",
  },
  {
    id: "cert-10", verifyId: "DZA-2026-KPGU-00421", userId: "user-student-7",
    userName: "Diya Patel", courseId: "course-2", courseTitle: "Machine Learning Fundamentals",
    universityId: "kpgu", universityName: "KPGU", instructorName: "Dr. Rajesh Patel",
    tier: CertificateTier.TIER_2, grade: "A+", score: 96, issuedAt: "2026-05-18",
    credentialId: "CR-2026-00421",
  },
  {
    id: "cert-11", verifyId: "DZA-2026-STFD-00015", userId: "user-student-9",
    userName: "Ananya Trivedi", courseId: "course-1", courseTitle: "Generative AI for Leaders",
    universityId: "stanford", universityName: "Stanford Institute for AI", instructorName: "Dr. Elena Rostova",
    tier: CertificateTier.TIER_3, grade: "A", score: 92, issuedAt: "2026-04-30",
    credentialId: "CR-2026-00015",
  },
  {
    id: "cert-12", verifyId: "DZA-2026-MSU-00156", userId: "user-student-10",
    userName: "Sai Raval", courseId: "course-10", courseTitle: "Design Thinking for Innovation",
    universityId: "msu", universityName: "MSU Baroda", instructorName: "Dr. Arjun Nair",
    tier: CertificateTier.TIER_1, grade: "A", score: 88, issuedAt: "2026-05-25",
    credentialId: "CR-2026-00156",
  },
];

export function getCertificatesByUser(userId: string): MockCertificate[] {
  return mockCertificates.filter((c) => c.userId === userId);
}

export function getCertificateByVerifyId(verifyId: string): MockCertificate | undefined {
  return mockCertificates.find((c) => c.verifyId === verifyId);
}

export function getCertificateById(id: string): MockCertificate | undefined {
  return mockCertificates.find((c) => c.id === id);
}

export function getCertificatesByUniversity(universityId: string): MockCertificate[] {
  return mockCertificates.filter((c) => c.universityId === universityId);
}
