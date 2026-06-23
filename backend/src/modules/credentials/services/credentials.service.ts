import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { CreateCredentialDto } from '../dto/CreateCredentialDto';
import { TemplateService } from './template.service';
import { v4 as uuidv4 } from 'uuid';
import { VerifyStatus } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class CredentialsService {
    constructor(
        private readonly credentialsRepository: CredentialsRepository,
        private readonly templateService: TemplateService,
        private readonly auditService: AuditService,
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
        const credential = await this.credentialsRepository.findByVerificationCode(code);

        if (!credential) {
            return { valid: false, message: 'Invalid Verification Code' };
        }

        if (credential.verificationStatus === 'REVOKED') {
            return { valid: false, message: 'This credential has been permanently revoked.' };
        }

        if (credential.verificationStatus === 'SUSPENDED') {
            return { valid: false, message: 'This credential is under review (Suspended).' };
        }

        return { valid: true, data: credential };
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
        return await this.credentialsRepository.findByUserId(userId);
    }

    async getAllCredentials() {
        return await this.credentialsRepository.findAll();
    }
}