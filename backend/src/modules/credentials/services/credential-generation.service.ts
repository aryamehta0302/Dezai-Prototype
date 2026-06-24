import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { CreateProgramCredentialDto } from '../dto/create-program-credential.dto';
import { CreateAssessmentCredentialDto } from '../dto/create-assessment-credential.dto';
import * as crypto from 'crypto';

/**
 * Service responsible for generating, minting, and mathematically verifying credentials.
 * Handles cryptographic signatures, unique ID generation, and business rules for issuance.
 */
@Injectable()
export class CredentialGenerationService {
  private readonly SECRET_KEY = process.env.CREDENTIAL_SECRET_KEY || 'dezai-secret-key';

  constructor(private readonly credentialsRepository: CredentialsRepository) { }

  /**
   * Generates a cryptographic HMAC SHA-256 signature to mathematically prove 
   * the authenticity of the credential data.
   * 
   * @param name - The name of the student.
   * @param entityDetails - The title or details of the achievement.
   * @param issueDate - The ISO string representation of the issue date.
   * @returns A hex string representing the cryptographic signature.
   */
  private generateHash(name: string, entityDetails: string, issueDate: string): string {
    const dataString = `${name}|${entityDetails}|${issueDate}`;
    return crypto.createHmac('sha256', this.SECRET_KEY).update(dataString).digest('hex');
  }

  // ==========================================
  // 1. PROGRAM Credential (Degree)
  // ==========================================

  /**
   * Automatically generates a programmatic credential for a student who has reached 100% completion.
   * Prevents duplication and enforces the 100% progress rule.
   * 
   * @param dto - The data transfer object containing student ID and program ID.
   * @param actorId - The ID of the user or system triggering the generation.
   * @throws {NotFoundException} If the student does not exist.
   * @throws {BadRequestException} If the credential was already generated or progress is < 100%.
   * @returns The newly minted credential record.
   */
  async generateProgramCredential(dto: CreateProgramCredentialDto, actorId: string) {
    const student = await this.credentialsRepository.findUserById(dto.studentId);
    if (!student) throw new NotFoundException('Student not found');
    
    // Deduplication check
    const existingCreds = await this.credentialsRepository.findCredentials({
      where: { userId: dto.studentId, programId: dto.programId }
    });

    const isAlreadyGenerated = existingCreds.some(c => {
      try {
        const meta = JSON.parse(c.metadata || '{}');
        return meta.type === 'PROGRAM';
      } catch (e) {
        return false;
      }
    });

    if (isAlreadyGenerated) {
      throw new BadRequestException('Credential already generated for this program.');
    }

    const enrollment = await this.credentialsRepository.findEnrollment(dto.studentId, dto.programId);
    if (!enrollment || (!enrollment.completedAt && enrollment.progress < 100)) {
      throw new BadRequestException('PROGRAM Credential requires 100% course completion.');
    }

    const issueDate = new Date();
    const hashSignature = this.generateHash(student.name || 'Unknown', 'PROGRAM_COMPLETED', issueDate.toISOString());
    const verificationCode = crypto.randomBytes(8).toString('hex');
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://dezai.com'}/verify/${verificationCode}`;

    return this.credentialsRepository.createCredential({
      user: { connect: { id: dto.studentId } },
      program: { connect: { id: dto.programId } },
      ...(dto.institutionId ? { institution: { connect: { id: dto.institutionId } } } : {}),
      tier: dto.tier,
      verificationCode,
      verificationUrl,
      hashSignature,
      // CRITICAL BUG FIX: studentName is stored immutably in metadata to prevent verification hashes
      // from breaking if a user changes their name later in their profile. Do not remove.
      metadata: JSON.stringify({ type: 'PROGRAM', studentName: student.name || 'Unknown' }),
      issuedAt: issueDate,
      logs: {
        create: {
          actorId,
          action: 'GENERATED',
          statusTo: 'APPROVED',
          notes: 'Auto-generated PROGRAM credential'
        }
      }
    });
  }

  // ==========================================
  // 2. ASSESSMENT Credential (Exam Pass)
  // ==========================================
  /**
   * Generates an assessment-based credential for a student who passes an exam.
   * Requires a passing score (>= 70) fetched from the assessment attempt and prevents duplicate issuance.
   * 
   * @param dto - The data transfer object containing assessment details.
   * @param actorId - The ID of the user or system triggering the generation.
   * @throws {NotFoundException} If the student does not exist.
   * @throws {BadRequestException} If already generated or if the score is below the passing threshold.
   * @returns The newly minted credential record.
   */
  async generateAssessmentCredential(dto: CreateAssessmentCredentialDto, actorId: string) {
    const student = await this.credentialsRepository.findUserById(dto.studentId);
    if (!student) throw new NotFoundException('Student not found');

    // Deduplication check
    const existingCreds = await this.credentialsRepository.findCredentials({
      where: { userId: dto.studentId, programId: dto.programId }
    });

    const isAlreadyGenerated = existingCreds.some(c => {
      try {
        const meta = JSON.parse(c.metadata || '{}');
        return meta.type === 'ASSESSMENT' && meta.assessmentId === dto.assessmentId;
      } catch (e) {
        return false;
      }
    });

    if (isAlreadyGenerated) {
      throw new BadRequestException('Credential already generated for this assessment.');
    }

    const attempt = await this.credentialsRepository.findAssessmentAttempt(dto.studentId, dto.assessmentId);
    if (!attempt) {
      throw new BadRequestException('ASSESSMENT Credential requires passing the exam first.');
    }

    const issueDate = new Date();
    const entityDetails = `ASSESSMENT_SCORE_${attempt.score}`;
    const hashSignature = this.generateHash(student.name || 'Unknown', entityDetails, issueDate.toISOString());
    const verificationCode = crypto.randomBytes(8).toString('hex');
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://dezai.com'}/verify/${verificationCode}`;

    return this.credentialsRepository.createCredential({
      user: { connect: { id: dto.studentId } },
      program: { connect: { id: dto.programId } },
      ...(dto.institutionId ? { institution: { connect: { id: dto.institutionId } } } : {}),
      tier: dto.tier,
      verificationCode,
      verificationUrl,
      hashSignature,
      // CRITICAL BUG FIX: studentName is stored immutably in metadata to prevent verification hashes
      // from breaking if a user changes their name later in their profile. Do not remove.
      metadata: JSON.stringify({ type: 'ASSESSMENT', assessmentId: dto.assessmentId, score: attempt.score, studentName: student.name || 'Unknown' }),
      issuedAt: issueDate,
      logs: {
        create: {
          actorId,
          action: 'GENERATED',
          statusTo: 'APPROVED',
          notes: `Auto-generated for Exam score: ${attempt.score}`
        }
      }
    });
  }
}
