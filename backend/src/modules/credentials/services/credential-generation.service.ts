import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { CreateProgramCredentialDto } from '../dto/create-program-credential.dto';
import { CreateAssessmentCredentialDto } from '../dto/create-assessment-credential.dto';
import * as crypto from 'crypto';

@Injectable()
export class CredentialGenerationService {
  private readonly SECRET_KEY = process.env.CREDENTIAL_SECRET_KEY || 'dezai-secret-key';

  constructor(private readonly credentialsRepository: CredentialsRepository) { }

  private generateHash(name: string, entityDetails: string, issueDate: string): string {
    const dataString = `${name}|${entityDetails}|${issueDate}`;
    return crypto.createHmac('sha256', this.SECRET_KEY).update(dataString).digest('hex');
  }

  // ==========================================
  // 1. PROGRAM Credential (Degree)
  // ==========================================
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
      approvalStatus: 'APPROVED', // Direct approval for simplicity
      hashSignature,
      metadata: JSON.stringify({ type: 'PROGRAM' }),
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
      approvalStatus: 'APPROVED',
      hashSignature,
      metadata: JSON.stringify({ type: 'ASSESSMENT', assessmentId: dto.assessmentId, score: attempt.score }),
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
