import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator to enforce Role-Based Access Control (RBAC) on route handlers.
 * Usage: @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
