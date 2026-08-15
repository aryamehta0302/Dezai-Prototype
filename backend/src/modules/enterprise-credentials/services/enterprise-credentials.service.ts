import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { EnterpriseCredentialsRepository } from '../repositories/enterprise-credentials.repository';
import { CreateEnterpriseCredentialDto } from '../dto/CreateEnterpriseCredentialDto';
import { EnterpriseTemplateService } from './enterprise-template.service';
import { PrismaService } from '../../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { VerifyStatus, ComplianceTrack, AuditAction, NotificationType } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import * as crypto from 'crypto';

@Injectable()
export class EnterpriseCredentialsService {
    private readonly logger = new Logger(EnterpriseCredentialsService.name);
    private readonly verificationCache = new Map<string, { result: any; expiresAt: number }>();
    private readonly verificationAttempts = new Map<string, { count: number; firstAttempt: number }>();

    constructor(
        private readonly repository: EnterpriseCredentialsRepository,
        private readonly templateService: EnterpriseTemplateService,
        private readonly auditService: AuditService,
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    private cacheGet(code: string): any | null {
        const cached = this.verificationCache.get(code);
        if (!cached) return null;
        if (Date.now() > cached.expiresAt) {
            this.verificationCache.delete(code);
            return null;
        }
        return cached.result;
    }

    private cacheSet(code: string, result: any, ttlMs: number = 300000): void {
        this.verificationCache.set(code, {
            result,
            expiresAt: Date.now() + ttlMs,
        });
    }

    private cacheEvict(code: string): void {
        this.verificationCache.delete(code);
    }

    private getSigningSecret(): string {
        const secret = process.env.CREDENTIAL_SIGNING_SECRET;
        if (!secret) {
            return 'dezai-default-signing-secret-key-32-chars-long';
        }
        return secret;
    }

    private signCredentialMetadata(
        credentialId: string,
        code: string,
        status: string,
        employeeId: string,
        organizationId: string,
        metadataObj: any
    ): string {
        const { signature, ...rest } = metadataObj;
        const secret = this.getSigningSecret();
        const payload = JSON.stringify({
            credentialId,
            code,
            status,
            employeeId,
            organizationId,
            metadata: rest
        });
        return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }

    private verifyCredentialMetadata(credential: any): boolean {
        if (!credential.metadata) return false;
        try {
            const metadataObj = JSON.parse(credential.metadata);
            if (!metadataObj.signature) return false;
            const expected = this.signCredentialMetadata(
                credential.id,
                credential.verificationCode,
                credential.verificationStatus,
                credential.employeeId,
                credential.organizationId,
                metadataObj,
            );
            return crypto.timingSafeEqual(Buffer.from(metadataObj.signature), Buffer.from(expected));
        } catch {
            return false;
        }
    }

    private logSecurityEvent(event: string, details: any): void {
        this.logger.warn(`[SECURITY] ${event}: ${JSON.stringify(details)}`);
    }

    async issueCredential(data: CreateEnterpriseCredentialDto, issuedByUserId: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: data.employeeId },
            include: { user: true }
        });
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        const template = data.templateId ? await this.templateService.getTemplateById(data.templateId) : null;
        const uniqueCode = crypto.randomBytes(9).toString('hex').toUpperCase();
        const publicUrl = `/verify/${uniqueCode}`;
        const credentialId = uuidv4();

        const metadataObj: any = {
            createdStatus: 'ACTIVE',
            createdAt: new Date().toISOString(),
            statusHistory: [{
                status: 'ACTIVE',
                changedBy: issuedByUserId || 'System',
                reason: 'Compliance Assessment completion',
                date: new Date().toISOString(),
            }],
            statusReason: '',
            statusLastChangedAt: new Date().toISOString(),
        };

        metadataObj.signature = this.signCredentialMetadata(
            credentialId,
            uniqueCode,
            'ACTIVE',
            data.employeeId,
            data.organizationId,
            metadataObj
        );

        const credential = await this.repository.create({
            id: credentialId,
            employeeId: data.employeeId,
            organizationId: data.organizationId,
            complianceAssessmentId: data.complianceAssessmentId,
            complianceTrack: data.complianceTrack,
            verificationCode: uniqueCode,
            qrCodeUrl: `/qr/${uniqueCode.toLowerCase()}.png`,
            verificationUrl: publicUrl,
            verificationStatus: 'ACTIVE',
            issuedAt: new Date(),
            templateId: data.templateId,
        });

        // Trigger Notification
        await this.notificationsService.createNotification(
            employee.userId,
            'New Compliance Credential Issued',
            `Congratulations! You have been issued a credential for ${data.complianceTrack} track compliance.`,
            NotificationType.CREDENTIAL
        );

        // Audit Logging
        await this.auditService.logAction(
            employee.userId,
            AuditAction.ENTERPRISE_CREDENTIAL_ISSUED,
            `Enterprise Credential "${credential.verificationCode}" (ID: ${credential.id}) issued to employee ${employee.id} (User: ${employee.userId})`
        );

        return credential;
    }

    async verifyCredential(code: string) {
        const cached = this.cacheGet(code);
        if (cached) return cached;

        const cred = await this.repository.findByVerificationCode(code);
        if (!cred) {
            return { valid: false, message: 'Invalid Verification Code' };
        }

        const isIntegrityValid = this.verifyCredentialMetadata(cred);
        if (!isIntegrityValid) {
            this.logSecurityEvent('TAMPER_DETECTED', {
                credentialId: cred.id,
                verificationCode: code,
                employeeId: cred.employeeId,
                attemptedStatus: cred.verificationStatus,
                message: 'HMAC signature mismatch — metadata has been modified outside authorized system'
            });

            const tamperResult = {
                valid: false,
                status: 'REVOKED' as const,
                message: 'Security Alert: Credential metadata tampering detected!',
                data: cred,
                tampered: true
            };
            this.cacheSet(code, tamperResult);

            await this.auditService.logAction(
                cred.employee.userId,
                AuditAction.ENTERPRISE_CREDENTIAL_ISSUED,
                `SECURITY ALERT: Tampering detected on enterprise credential ${cred.id} (Code: ${code}).`
            );

            return tamperResult;
        }

        if (cred.verificationStatus === 'REVOKED') {
            const result = { valid: false, status: 'REVOKED' as const, message: 'This credential has been permanently revoked.', data: cred };
            this.cacheSet(code, result);
            return result;
        }

        if (cred.verificationStatus === 'SUSPENDED') {
            const result = { valid: false, status: 'SUSPENDED' as const, message: 'This credential is under review (Suspended).', data: cred };
            this.cacheSet(code, result);
            return result;
        }

        const result = { valid: true, status: 'ACTIVE' as const, data: cred };
        this.cacheSet(code, result);
        return result;
    }

    async changeCredentialStatus(id: string, status: VerifyStatus, requesterUserId: string, reason?: string) {
        const current = await this.repository.findById(id);
        if (!current) {
            throw new NotFoundException('Credential not found');
        }

        this.cacheEvict(current.verificationCode);

        const updated = await this.repository.updateStatus(id, status);

        // Audit Logging
        await this.auditService.logAction(
            requesterUserId,
            AuditAction.CREDENTIAL_ISSUED, // reuse existing or custom
            `Enterprise Credential "${current.verificationCode}" status updated to ${status}. Reason: ${reason || 'None'}`
        );

        // Send Notification
        await this.notificationsService.createNotification(
            current.employee.userId,
            `Credential Status Updated`,
            `Your compliance credential for ${current.complianceTrack} status is now ${status}.`,
            NotificationType.UPDATE
        );

        return updated;
    }

    async batchStatusUpdate(ids: string[], status: VerifyStatus, requesterUserId: string, reason?: string) {
        const count = await this.repository.batchUpdateStatus(ids, status);

        for (const id of ids) {
            const cred = await this.repository.findById(id);
            if (cred) {
                this.cacheEvict(cred.verificationCode);
                await this.notificationsService.createNotification(
                    cred.employee.userId,
                    `Credential Status Updated`,
                    `Your compliance credential for ${cred.complianceTrack} status is now ${status}.`,
                    NotificationType.UPDATE
                );
            }
        }

        await this.auditService.logAction(
            requesterUserId,
            AuditAction.CREDENTIAL_ISSUED,
            `Batch updated ${ids.length} enterprise credentials to status ${status}. Reason: ${reason || 'None'}`
        );

        return { updated: count.count, status };
    }

    async getEmployeeCredentials(employeeId: string) {
        return await this.repository.findByEmployeeId(employeeId);
    }

    async getEmployeeCredentialsByUserId(userId: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId }
        });
        if (!employee) {
            throw new NotFoundException('Employee record not found for this user');
        }
        return await this.repository.findByEmployeeId(employee.id);
    }

    async getCredentialDetails(id: string) {
        const cred = await this.repository.findById(id);
        if (!cred) {
            throw new NotFoundException('Credential not found');
        }
        return cred;
    }

    async getCredentialAnalytics(organizationId: string) {
        return await this.repository.getAnalytics(organizationId);
    }

    async searchCredentials(organizationId: string, params: any) {
        return await this.repository.search({ ...params, organizationId });
    }
}
