import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { OrgSize } from '@prisma/client';

/**
 * Data Transfer Object for creating a new Organization.
 * Validates the payload when registering an enterprise entity.
 */
export class CreateOrganizationDto {
  /**
   * The name of the organization.
   * @example "Acme Corp"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Optional URL pointing to the organization's logo.
   */
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  /**
   * Optional industry category for the organization.
   */
  @IsOptional()
  @IsString()
  industry?: string;

  /**
   * Optional size classification of the organization.
   */
  @IsOptional()
  @IsEnum(OrgSize)
  size?: OrgSize;

  /**
   * Optional billing email contact for the organization.
   */
  @IsOptional()
  @IsString()
  billingEmail?: string;
}

/**
 * Data Transfer Object for updating an existing Organization.
 * All fields are optional to allow partial updates.
 */
export class UpdateOrganizationDto {
  /**
   * The new name of the organization.
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * The new logo URL.
   */
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  /**
   * The new industry category.
   */
  @IsOptional()
  @IsString()
  industry?: string;

  /**
   * The new size classification.
   */
  @IsOptional()
  @IsEnum(OrgSize)
  size?: OrgSize;

  /**
   * The new billing email contact.
   */
  @IsOptional()
  @IsString()
  billingEmail?: string;
}
