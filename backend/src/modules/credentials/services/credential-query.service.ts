import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';

/**
 * Service responsible for fetching credential data for authorized users.
 * Handles queries for a user's own credentials and specific credential lookups by ID.
 */
@Injectable()
export class CredentialQueryService {
  constructor(private readonly credentialsRepository: CredentialsRepository) {}

  /**
   * Retrieves all credentials belonging to a specific user.
   * Includes associated program, institution, and user metadata (excluding PII like email).
   * 
   * @param userId - The ID of the user whose credentials are to be fetched.
   * @returns An array of credential records for the user.
   */
  async getMyCredentials(userId: string) {
    return this.credentialsRepository.findCredentials({
      where: { userId },
      include: {
        program: true,
        institution: true,
        // CRITICAL BUG FIX: Removed 'email' from the select statement to prevent PII data leaks.
        // Do not add email back without explicit authorization checks.
        user: { select: { name: true } },
      },
    });
  }

  /**
   * Retrieves a specific credential by its ID.
   * Enforces strict ownership checks unless the requester is a platform admin.
   * 
   * @param id - The unique identifier of the credential.
   * @param requestUserId - The ID of the authenticated user making the request.
   * @param requestUserRole - The role of the authenticated user making the request.
   * @throws {NotFoundException} If the credential does not exist.
   * @throws {ForbiddenException} If the user does not own the credential and is not an admin.
   * @returns The credential record if authorization succeeds.
   */
  async getCredentialById(id: string, requestUserId?: string, requestUserRole?: string) {
    const credential = await this.credentialsRepository.findCredential(
      { id },
      {
        program: true,
        institution: true,
        // CRITICAL BUG FIX: Removed 'email' from the select statement to prevent PII data leaks.
        // Do not add email back without explicit authorization checks.
        user: { select: { name: true } },
      }
    );

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    if (credential.userId !== requestUserId && requestUserRole !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('You do not have permission to view this credential.');
    }

    return credential;
  }
}
