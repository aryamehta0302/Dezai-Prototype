import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { CreateCredentialDto } from '../dto/CreateCredentialDto';
import { TemplateService } from './template.service';
import { PrismaService } from '../../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { VerifyStatus, CredentialTier } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class CredentialsService {
    constructor(
        private readonly credentialsRepository: CredentialsRepository,
        private readonly templateService: TemplateService,
        private readonly auditService: AuditService,
        private readonly prisma: PrismaService,
    ) { }

    async issueCredential(data: CreateCredentialDto) {
        const template = await this.templateService.getTemplateById(data.templateId);
        if (!template) {
            throw new BadRequestException('Invalid Template ID');
        }
        if (template.type !== data.credentialType) {
            throw new BadRequestException('Template Type mismatch');
        }

        const finalTier = data.tier || template.defaultTier;

        const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 18).toUpperCase();
        const publicUrl = `/verify/${uniqueCode}`;

        const credentialData = {
            userId: data.userId,
            programId: data.programId,
            institutionId: data.institutionId,
            issuedById: data.issuedById,
            tier: finalTier,
            verificationCode: uniqueCode,
            verificationUrl: publicUrl,
            verificationStatus: 'ACTIVE' as const,
            credentialTemplateId: data.templateId,
        };

        const credential = await this.credentialsRepository.createCredential(credentialData);

        await this.auditService.logAction(
            data.issuedById,
            AuditAction.CREDENTIAL_ISSUED,
            `Credential "${credential.verificationCode}" (ID: ${credential.id}) issued to user ${data.userId} for program ${data.programId}`,
        );

        return credential;
    }

    async verifyCredential(code: string) {
        const cred = await this.prisma.credential.findUnique({
            where: { verificationCode: code },
            include: {
                program: { include: { institution: true } },
                user: { select: { id: true, name: true, email: true } },
                issuer: { select: { id: true, name: true } },
            },
        });

        if (!cred) {
            return { valid: false, message: 'Invalid Verification Code' };
        }

        if (cred.verificationStatus === 'REVOKED') {
            return { valid: false, message: 'This credential has been permanently revoked.' };
        }

        if (cred.verificationStatus === 'SUSPENDED') {
            return { valid: false, message: 'This credential is under review (Suspended).' };
        }

        return { valid: true, data: cred };
    }

    async changeCredentialStatus(id: string, status: VerifyStatus, requesterId?: string) {
        const result = await this.credentialsRepository.updateStatus(id, status);

        if (requesterId) {
            await this.auditService.logAction(
                requesterId,
                AuditAction.CREDENTIAL_ISSUED,
                `Credential (ID: ${id}) status changed to ${status}`,
            );
        }

        return result;
    }

    async getStudentCredentials(userId: string) {
        return this.prisma.credential.findMany({
            where: { userId },
            include: {
                program: { include: { institution: true } },
                user: { select: { id: true, name: true, email: true } },
                issuer: { select: { id: true, name: true } },
            },
            orderBy: { issuedAt: 'desc' },
        });
    }

    async getAllCredentials() {
        return await this.credentialsRepository.findAll();
    }

    async getCredentialDetails(id: string) {
        let cred = await this.prisma.credential.findUnique({
            where: { id },
            include: {
                program: { include: { institution: true } },
                user: { select: { id: true, name: true, email: true } },
                issuer: { select: { id: true, name: true } },
            },
        });

        if (!cred) {
            cred = await this.prisma.credential.findUnique({
                where: { verificationCode: id },
                include: {
                    program: { include: { institution: true } },
                    user: { select: { id: true, name: true, email: true } },
                    issuer: { select: { id: true, name: true } },
                },
            });
        }

        if (!cred) {
            throw new NotFoundException('Credential record not found');
        }

        return cred;
    }

    async checkEligibility(userId: string, programId: string): Promise<{ eligible: boolean; reason?: string }> {
        const program = await this.prisma.program.findUnique({
            where: { id: programId },
            include: { tracks: { include: { modules: { include: { assessments: true } } } } },
        });

        if (!program) {
            throw new NotFoundException(`Program with ID ${programId} not found`);
        }

        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_programId: { userId, programId } },
        });

        if (!enrollment) {
            return { eligible: false, reason: 'Student is not enrolled in this program' };
        }

        if (enrollment.progress < 100 && !enrollment.completedAt) {
            return { eligible: false, reason: `Program completion is at ${enrollment.progress}%. All lessons must be completed.` };
        }

        const assessments = program.tracks.flatMap((track) =>
            track.modules.flatMap((module) => module.assessments)
        );

        if (assessments.length === 0) {
            return { eligible: true };
        }

        for (const assessment of assessments) {
            const passedAttempt = await this.prisma.assessmentAttempt.findFirst({
                where: { userId, assessmentId: assessment.id, passed: true },
            });

            if (!passedAttempt) {
                return { eligible: false, reason: `Assessment "${assessment.title}" has not been passed yet.` };
            }
        }

        return { eligible: true };
    }

    async issueStudentCredential(userId: string, programId: string) {
        const { eligible, reason } = await this.checkEligibility(userId, programId);
        if (!eligible) {
            throw new BadRequestException(reason || 'Student is not eligible for this credential.');
        }

        const existing = await this.prisma.credential.findFirst({
            where: { userId, programId },
        });

        if (existing) {
            return existing;
        }

        const program = await this.prisma.program.findUnique({
            where: { id: programId },
            include: { institution: true, faculty: true },
        });

        if (!program) {
            throw new NotFoundException(`Program ${programId} not found`);
        }

        let issuerId = program.faculty?.userId;
        if (!issuerId) {
            const admin = await this.prisma.user.findFirst({ where: { role: 'DEZAI_ADMIN' } });
            if (!admin) {
                throw new NotFoundException('No issuer or administrator found to sign the credential.');
            }
            issuerId = admin.id;
        }

        const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 18).toUpperCase();
        const tier = this.getTierForProgram(programId);

        return this.credentialsRepository.createCredential({
            userId,
            programId,
            institutionId: program.institutionId,
            issuedById: issuerId,
            tier,
            verificationCode: uniqueCode,
            verificationUrl: `/verify/${uniqueCode}`,
            verificationStatus: 'ACTIVE' as const,
        });
    }

    private getTierForProgram(programId: string): CredentialTier {
        const citadelCourses = ['course-1', 'course-3', 'course-12'];
        const arenaCourses = ['course-2', 'course-5', 'course-6', 'course-8', 'course-9'];

        if (citadelCourses.includes(programId)) {
            return CredentialTier.CITADEL;
        } else if (arenaCourses.includes(programId)) {
            return CredentialTier.ARENA;
        } else {
            return CredentialTier.FORGE;
        }
    }
}
