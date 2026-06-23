import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import * as crypto from 'crypto';

@Injectable()
export class CredentialVerificationService {
  private readonly SECRET_KEY = process.env.CREDENTIAL_SECRET_KEY || 'dezai-secret-key';

  constructor(private readonly credentialsRepository: CredentialsRepository) { }

  private generateHash(name: string, entityDetails: string, issueDate: string): string {
    const dataString = `${name}|${entityDetails}|${issueDate}`;
    return crypto.createHmac('sha256', this.SECRET_KEY).update(dataString).digest('hex');
  }

  async getAllCredentials() {
    return this.credentialsRepository.findCredentials({
      include: { user: true, program: true }
    });
  }

  async getStudentCredentials(studentId: string) {
    return this.credentialsRepository.findCredentials({
      where: { userId: studentId },
      include: {
        program: true,
        institution: true
      }
    });
  }

  async verifyCredential(idOrCode: string) {
    const credential = await this.credentialsRepository.findCredential(
      { OR: [{ id: idOrCode }, { verificationCode: idOrCode }] },
      { user: true }
    );

    if (!credential) throw new NotFoundException('Credential not found');

    const metadata = JSON.parse(credential.metadata || '{}');

    // Logic to rebuild the details string for Hash Recalculation
    let entityDetails = 'PROGRAM_COMPLETED';
    if (metadata.type === 'ASSESSMENT') entityDetails = `ASSESSMENT_SCORE_${metadata.score}`;

    const calculatedHash = this.generateHash(
      credential.user.name || 'Unknown',
      entityDetails,
      credential.issuedAt.toISOString()
    );

    if (calculatedHash !== credential.hashSignature) {
      throw new BadRequestException('Tampered/Fake Credential detected.');
    }

    return {
      id: credential.id,
      studentName: credential.user.name,
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
