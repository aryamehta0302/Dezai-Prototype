// ============================================================
// Shared Types — Generic, domain-agnostic types
// ============================================================

export enum UserRole {
  STUDENT = "STUDENT",
  FACULTY = "FACULTY",
  UNIVERSITY_ADMIN = "UNIVERSITY_ADMIN",
  DEZAI_ADMIN = "DEZAI_ADMIN",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  ORGANIZATION_MANAGER = "ORGANIZATION_MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum CertificateTier {
  TIER_1 = "TIER_1", // Dezai Core (Foundational)
  TIER_2 = "TIER_2", // University Accredited (Academic)
  TIER_3 = "TIER_3", // Industry Verified (Professional)
}

export enum CourseCategory {
  AI = "AI",
  COMMERCE = "COMMERCE",
  DESIGN = "DESIGN",
}

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
}

export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum QuizAttemptStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  TIMED_OUT = "TIMED_OUT",
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TrendIndicator {
  value: number;
  direction: "up" | "down" | "neutral";
  label?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
