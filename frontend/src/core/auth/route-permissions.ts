import { UserRole } from "@/shared/types/common.types";
import { RoleGroups } from "./permissions";

/**
 * Route Permission Map
 *
 * Maps route path prefixes to the roles allowed to access them.
 * Used by middleware and AuthGuard to enforce access control.
 *
 * Rules:
 * - More specific prefixes take priority (evaluated top-to-bottom, first match wins).
 * - Routes not listed here are treated as PUBLIC (no auth required).
 * - The `requiresAuth` flag distinguishes "any authenticated user" from role-restricted.
 */

export interface RoutePermission {
  /** Path prefix to match (e.g. "/dashboard") */
  pathPrefix: string;
  /** Roles allowed to access this route group */
  allowedRoles?: readonly UserRole[];
  /** If true, any authenticated user can access (allowedRoles ignored) */
  anyAuthenticated?: boolean;
  /** Redirect path when access is denied */
  deniedRedirect?: string;
}

/**
 * Ordered route permission rules.
 * First matching prefix wins — place specific routes before general ones.
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // ─── Admin Routes ───
  {
    pathPrefix: "/admin",
    allowedRoles: RoleGroups.PLATFORM_ADMIN,
    deniedRedirect: "/unauthorized",
  },

  // ─── University Admin Routes ───
  {
    pathPrefix: "/university",
    allowedRoles: RoleGroups.INSTITUTION_ADMINS,
    deniedRedirect: "/unauthorized",
  },

  // ─── Faculty Routes ───
  {
    pathPrefix: "/faculty",
    allowedRoles: RoleGroups.FACULTY_AND_ABOVE,
    deniedRedirect: "/unauthorized",
  },

  // ─── Employee Learning Routes ───
  {
    pathPrefix: "/learning",
    allowedRoles: [UserRole.EMPLOYEE, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER, UserRole.DEZAI_ADMIN],
    deniedRedirect: "/unauthorized",
  },

  // ─── Enterprise Routes ───
  {
    pathPrefix: "/enterprise/dashboard",
    allowedRoles: [UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER, UserRole.DEZAI_ADMIN],
    deniedRedirect: "/unauthorized",
  },
  {
    pathPrefix: "/enterprise/credentials",
    allowedRoles: [UserRole.EMPLOYEE, UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER, UserRole.DEZAI_ADMIN],
    deniedRedirect: "/unauthorized",
  },

  // ─── Student Routes (includes shared learner pages) ───
  {
    pathPrefix: "/dashboard",
    allowedRoles: RoleGroups.ALL,
  },
  {
    pathPrefix: "/programs",
    allowedRoles: RoleGroups.ALL,
  },
  {
    pathPrefix: "/learn",
    allowedRoles: [...RoleGroups.LEARNERS, UserRole.FACULTY],
  },
  {
    pathPrefix: "/assessments",
    allowedRoles: RoleGroups.ALL,
  },
  {
    pathPrefix: "/credentials",
    allowedRoles: RoleGroups.ALL,
  },
  {
    pathPrefix: "/profile",
    allowedRoles: RoleGroups.ALL,
  },

  // ─── Onboarding (any authenticated but un-roled user) ───
  {
    pathPrefix: "/onboarding",
    anyAuthenticated: true,
  },
];

/**
 * Public paths that never require authentication.
 * Auth middleware skips these entirely.
 */
export const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth",
  "/verify",
  "/catalog",
  "/about",
  "/help",
  "/terms",
  "/privacy",
  "/institutions",
  "/unauthorized",
] as const;

/**
 * Check if a path is public (no auth required).
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * Find the matching route permission for a given path.
 * Returns undefined if no rule matches (treat as requiring auth by default).
 */
export function getRoutePermission(pathname: string): RoutePermission | undefined {
  return ROUTE_PERMISSIONS.find((rule) => pathname.startsWith(rule.pathPrefix));
}

/**
 * Check if a user role is authorized for a given path.
 */
export function isAuthorizedForPath(pathname: string, userRole: UserRole): boolean {
  const rule = getRoutePermission(pathname);

  // No rule found — require auth but allow any authenticated user
  if (!rule) return true;

  // Any authenticated user is allowed
  if (rule.anyAuthenticated) return true;

  // Check role allowlist
  return rule.allowedRoles?.includes(userRole) ?? false;
}
