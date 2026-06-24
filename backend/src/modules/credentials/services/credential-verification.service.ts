import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import * as crypto from 'crypto';

/**
 * Service responsible for the cryptographic verification of credentials.
 * Ensures that credentials have not been tampered with since issuance.
 */
@Injectable()
export class CredentialVerificationService {
  private readonly SECRET_KEY = process.env.CREDENTIAL_SECRET_KEY || 'dezai-secret-key';

  constructor(private readonly credentialsRepository: CredentialsRepository) { }

  /**
   * Internal helper to recalculate the cryptographic hash based on the original data.
   * 
   * @param name - The student's name at the time of issuance.
   * @param entityDetails - The program or assessment achievement string.
   * @param issueDate - The precise timestamp of issuance.
   * @returns The recalculated hex signature.
   */
  private generateHash(name: string, entityDetails: string, issueDate: string): string {
    const dataString = `${name}|${entityDetails}|${issueDate}`;
    return crypto.createHmac('sha256', this.SECRET_KEY).update(dataString).digest('hex');
  }

  /**
   * Retrieves all credentials in the system.
   * Admin use only.
   */
  async getAllCredentials() {
    return this.credentialsRepository.findCredentials({
      include: { user: true, program: true }
    });
  }

  /**
   * Retrieves all credentials for a specific student.
   * 
   * @param studentId - The ID of the student.
   */
  async getStudentCredentials(studentId: string) {
    return this.credentialsRepository.findCredentials({
      where: { userId: studentId },
      include: {
        program: true,
        institution: true
      }
    });
  }

  /**
   * Public-facing method to mathematically verify a credential's authenticity.
   * Recalculates the hash and compares it against the stored `hashSignature`.
   * 
   * @param idOrCode - The ID or public `verificationCode` of the credential.
   * @throws {NotFoundException} If the record does not exist.
   * @throws {BadRequestException} If the metadata is corrupted or the hash does not match (tampering detected).
   * @returns The verified, safe credential data payload.
   */
  async verifyCredential(idOrCode: string) {
    const credential = await this.credentialsRepository.findCredential(
      { OR: [{ id: idOrCode }, { verificationCode: idOrCode }] },
      { user: true }
    );

    if (!credential) throw new NotFoundException('Credential not found');

    let metadata: any = {};
    try {
      // CRITICAL BUG FIX: Wrapped JSON.parse in try/catch to prevent 500 errors 
      // if metadata ever gets corrupted or manually edited in the DB to an invalid format.
      metadata = JSON.parse(credential.metadata || '{}');
    } catch (e) {
      throw new BadRequestException('Invalid credential metadata format');
    }

    // Logic to rebuild the details string for Hash Recalculation
    let entityDetails = 'PROGRAM_COMPLETED';
    if (metadata.type === 'ASSESSMENT') entityDetails = `ASSESSMENT_SCORE_${metadata.score}`;
    else if (metadata.type === 'MERIT') entityDetails = metadata.awardTitle;

    const studentName = metadata.studentName || credential.user.name || 'Unknown';
    
    const calculatedHash = this.generateHash(
      studentName,
      entityDetails,
      // CRITICAL BUG FIX: Wrapped credential.issuedAt in new Date() before calling toISOString()
      // to ensure consistency between JS Date formatting and DB Date retrieval formatting.
      new Date(credential.issuedAt).toISOString()
    );

    if (calculatedHash !== credential.hashSignature) {
      throw new BadRequestException('Tampered/Fake Credential detected.');
    }

    return {
      id: credential.id,
      studentName: studentName,
      tier: credential.tier,
      issueDate: credential.issuedAt,
      programId: credential.programId,
      institutionId: credential.institutionId,
      type: metadata.type,
      details: metadata,
      status: credential.verificationStatus,
      verificationUrl: credential.verificationUrl,
      hashSignature: credential.hashSignature
    };
  }
}
