import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrgAdminRole } from '@prisma/client';

/**
 * Data Transfer Object for assigning a Role (RBAC) to a user within an Organization.
 */
export class AssignOrgAdminDto {
  /**
   * The ID of the User being granted admin privileges.
   */
  @IsNotEmpty()
  @IsString()
  userId: string;

  /**
   * The specific admin role being assigned (e.g., OWNER, ADMIN, MANAGER).
   */
  @IsNotEmpty()
  @IsEnum(OrgAdminRole)
  role: OrgAdminRole;
}
