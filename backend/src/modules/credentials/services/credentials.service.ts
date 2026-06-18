import { Injectable, BadRequestException } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { CreateCredentialDto } from '../dto/CreateCredentialDto';
import { TemplateService } from './template.service';
import { v4 as uuidv4 } from 'uuid';
import { VerifyStatus } from '@prisma/client';

@Injectable()
export class CredentialsService {
    constructor(
        private readonly credentialsRepository: CredentialsRepository,
        private readonly templateService: TemplateService
    ) { }

    async issueCredential(data: CreateCredentialDto) {
        // Validate Template
        const template = await this.templateService.getTemplateById(data.templateId);
        if (!template) {
            throw new BadRequestException('Invalid Template ID');
        }
        if (template.type !== data.credentialType) {
            throw new BadRequestException('Template Type mismatch');
        }

        // Auto-triggers logic: Set tier based on template defaults if not provided
        const finalTier = data.tier || template.defaultTier;

        // Generate unique 18-character verification code 
        const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 18).toUpperCase();

        // Generate Public Route URL
        const publicUrl = `/verify/${uniqueCode}`;

        // Prepare data for database
        const credentialData = {
            userId: data.userId,
            programId: data.programId,
            institutionId: data.institutionId,
            issuedById: data.issuedById,
            tier: finalTier,
            verificationCode: uniqueCode,
            verificationUrl: publicUrl,
            verificationStatus: 'ACTIVE',
            credentialTemplateId: data.templateId,
        };

        // Call Repository to save it
        return await this.credentialsRepository.createCredential(credentialData);
    }

    // The Verification Logic
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

    // Faculty Status Update Logic
    async changeCredentialStatus(id: string, status: VerifyStatus) {
        return await this.credentialsRepository.updateStatus(id, status);
    }

    // Student Credentials Logic
    async getStudentCredentials(userId: string) {
        return await this.credentialsRepository.findByUserId(userId);
    }

    // Faculty Dashboard Logic
    async getAllCredentials() {
        return await this.credentialsRepository.findAll();
    }
}