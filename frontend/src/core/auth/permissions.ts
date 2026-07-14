import { UserRole } from "@/shared/types/common.types";

/**
 * Centralized Permission Definitions
 *
 * All role-based access checks flow through this file.
 * No layout or guard should hardcode role arrays directly.
 */

/** Hierarchy index — higher = more privileged */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.STUDENT]: 0,
  [UserRole.EMPLOYEE]: 0,
  [UserRole.FACULTY]: 1,
  [UserRole.ORGANIZATION_MANAGER]: 1,
  [UserRole.UNIVERSITY_ADMIN]: 2,
  [UserRole.ORGANIZATION_ADMIN]: 2,
  [UserRole.DEZAI_ADMIN]: 3,
};

/** Check if a role meets or exceeds the required level */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/** Check if a role is in an explicit allowlist */
export function isRoleAllowed(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/** Role group presets for common access patterns */
export const RoleGroups = {
  /** All authenticated users */
  ALL: [
    UserRole.STUDENT,
    UserRole.FACULTY,
    UserRole.UNIVERSITY_ADMIN,
    UserRole.DEZAI_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MANAGER,
    UserRole.EMPLOYEE,
  ],

  /** Learners who consume content */
  LEARNERS: [UserRole.STUDENT, UserRole.EMPLOYEE],

  /** Content creators and managers */
  CONTENT_MANAGERS: [
    UserRole.FACULTY,
    UserRole.UNIVERSITY_ADMIN,
    UserRole.DEZAI_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MANAGER,
  ],

  /** Faculty and above */
  FACULTY_AND_ABOVE: [UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN],

  /** Institution-level administrators */
  INSTITUTION_ADMINS: [UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN],

  /** Organization-level administrators */
  ORGANIZATION_ADMINS: [UserRole.ORGANIZATION_ADMIN, UserRole.DEZAI_ADMIN],

  /** Platform super-admin only */
  PLATFORM_ADMIN: [UserRole.DEZAI_ADMIN],
} as const;

/** Default dashboard path for each role after login */
export const DEFAULT_DASHBOARD: Record<UserRole, string> = {
  [UserRole.STUDENT]: "/dashboard",
  [UserRole.FACULTY]: "/dashboard",
  [UserRole.UNIVERSITY_ADMIN]: "/dashboard",
  [UserRole.DEZAI_ADMIN]: "/dashboard",
  [UserRole.ORGANIZATION_ADMIN]: "/enterprise/dashboard",
  [UserRole.ORGANIZATION_MANAGER]: "/enterprise/dashboard",
  [UserRole.EMPLOYEE]: "/enterprise/credentials",
};

/** Get the appropriate dashboard redirect for a user role */
export function getDashboardForRole(role: UserRole): string {
  return DEFAULT_DASHBOARD[role] ?? "/dashboard";
}
