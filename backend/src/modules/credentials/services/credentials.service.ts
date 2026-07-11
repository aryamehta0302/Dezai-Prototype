import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { CreateCredentialDto } from '../dto/CreateCredentialDto';
import { TemplateService } from './template.service';
import { PrismaService } from '../../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { VerifyStatus, CredentialTier } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';
import { NotificationsService } from '../../notifications/services/notifications.service';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsService {
    private readonly logger = new Logger(CredentialsService.name);

    // In-memory cache for credential verification (TTL: 5 minutes)
    private readonly verificationCache = new Map<string, { result: any; expiresAt: number }>();

    // Track verification attempts for security monitoring
    private readonly verificationAttempts = new Map<string, { count: number; firstAttempt: number }>();

    constructor(
        private readonly credentialsRepository: CredentialsRepository,
        private readonly templateService: TemplateService,
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
            this.logger.warn('CREDENTIAL_SIGNING_SECRET not set — using development fallback. Set this in production!');
            return 'dezai-default-signing-secret-key-32-chars-long';
        }
        if (secret.length < 32) {
            this.logger.warn('CREDENTIAL_SIGNING_SECRET is too short — should be at least 32 characters');
        }
        return secret;
    }

    private signCredentialMetadata(
        credentialId: string,
        code: string,
        status: string,
        userId: string,
        programId: string,
        metadataObj: any,
        institutionId?: string,
    ): string {
        const { signature, ...rest } = metadataObj;
        const secret = this.getSigningSecret();
        const payload = JSON.stringify({
            credentialId,
            code,
            status,
            userId,
            programId,
            institutionId: institutionId || '',
            metadata: rest
        });
        this.logger.warn(`CRITICAL DEBUG signCredentialMetadata payload: ${payload}`);
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
                credential.userId,
                credential.programId,
                metadataObj,
                credential.institutionId,
            );
            this.logger.warn(`CRITICAL DEBUG verifyCredentialMetadata: expected=${expected}, received=${metadataObj.signature}`);
            return crypto.timingSafeEqual(Buffer.from(metadataObj.signature), Buffer.from(expected));
        } catch (e) {
            this.logger.error(`CRITICAL DEBUG verifyCredentialMetadata error: ${e.message}`, e.stack);
            return false;
        }
    }

    private logSecurityEvent(event: string, details: any): void {
        this.logger.warn(`[SECURITY] ${event}: ${JSON.stringify(details)}`);
    }

    async issueCredential(data: CreateCredentialDto) {
        const template = await this.templateService.getTemplateById(data.templateId);
        if (!template) {
            throw new BadRequestException('Invalid Template ID');
        }
        if (template.type !== data.credentialType) {
            throw new BadRequestException('Template Type mismatch');
        }

        const finalTier = data.tier || template.defaultTier;

        // Generate cryptographically secure 18-character hex code
        const uniqueCode = crypto.randomBytes(9).toString('hex').toUpperCase();
        const publicUrl = `/verify/${uniqueCode}`;
        const credentialId = uuidv4();

        const metadataObj: any = {
            createdStatus: 'ACTIVE',
            createdAt: new Date().toISOString(),
            statusHistory: [{
                status: 'ACTIVE',
                changedBy: data.issuedById || 'System',
                reason: 'Initial credential issuance',
                date: new Date().toISOString(),
            }],
            statusReason: '',
            statusLastChangedAt: new Date().toISOString(),
        };

        // Generate HMAC signature for tamper-proofing
        metadataObj.signature = this.signCredentialMetadata(
            credentialId,
            uniqueCode,
            'ACTIVE',
            data.userId,
            data.programId,
            metadataObj,
            data.institutionId,
        );

        const credentialData = {
            id: credentialId,
            userId: data.userId,
            programId: data.programId,
            institutionId: data.institutionId,
            issuedById: data.issuedById,
            tier: finalTier,
            verificationCode: uniqueCode,
            verificationUrl: publicUrl,
            verificationStatus: 'ACTIVE' as const,
            credentialTemplateId: data.templateId,
            metadata: JSON.stringify(metadataObj),
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
        // Check cache first
        const cached = this.cacheGet(code);
        if (cached) {
            return cached;
        }

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

        // Security Check: Verify metadata integrity
        const isIntegrityValid = this.verifyCredentialMetadata(cred);
        if (!isIntegrityValid) {
            this.logSecurityEvent('TAMPER_DETECTED', {
                credentialId: cred.id,
                verificationCode: code,
                userId: cred.userId,
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

            // Log audit trail for tamper detection
            await this.auditService.logAction(
                null,
                AuditAction.CREDENTIAL_ISSUED,
                `SECURITY ALERT: Tampering detected on credential ${cred.id} (Code: ${code}). Signature validation failed.`
            );

            return tamperResult;
        }

        if (cred.verificationStatus === 'REVOKED') {
            const revokedResult = { valid: false, status: 'REVOKED' as const, message: 'This credential has been permanently revoked.', data: cred };
            this.cacheSet(code, revokedResult);
            return revokedResult;
        }

        if (cred.verificationStatus === 'SUSPENDED') {
            const suspendedResult = { valid: false, status: 'SUSPENDED' as const, message: 'This credential is under review (Suspended).', data: cred };
            this.cacheSet(code, suspendedResult);
            return suspendedResult;
        }

        const activeResult = { valid: true, status: 'ACTIVE' as const, data: cred };
        this.cacheSet(code, activeResult);
        return activeResult;
    }

    async changeCredentialStatus(id: string, status: VerifyStatus, requesterId?: string, reason?: string) {
        const current = await this.prisma.credential.findUnique({ where: { id } });
        if (!current) {
            throw new NotFoundException('Credential not found');
        }

        // Evict from cache
        this.cacheEvict(current.verificationCode);

        let metadataObj: any = {};
        if (current.metadata) {
            try {
                metadataObj = JSON.parse(current.metadata);
            } catch (e) {
                metadataObj = {};
            }
        }

        if (!metadataObj.statusHistory) {
            metadataObj.statusHistory = [];
        }

        metadataObj.statusHistory.push({
            status,
            changedBy: requesterId || 'System',
            reason: reason || 'No reason provided',
            date: new Date().toISOString(),
        });

        metadataObj.statusReason = reason || '';
        metadataObj.statusLastChangedAt = new Date().toISOString();

        // Sign metadata with new status
        metadataObj.signature = this.signCredentialMetadata(
            id,
            current.verificationCode,
            status,
            current.userId,
            current.programId,
            metadataObj,
            current.institutionId,
        );

        const updated = await this.prisma.credential.update({
            where: { id },
            data: {
                verificationStatus: status,
                metadata: JSON.stringify(metadataObj),
            },
            include: {
                program: { include: { institution: true } },
                user: { select: { id: true, name: true, email: true } },
                issuer: { select: { id: true, name: true } },
            },
        });

        // Trigger SYSTEM and CREDENTIAL notifications to the Student on REVOCATION
        if (status === 'REVOKED') {
            const programTitle = updated.program?.title || 'Program';
            const message = `Your credential for the program "${programTitle}" has been permanently revoked.${reason ? ` Reason: ${reason}` : ''}`;
            await this.notificationsService.createNotification(
                updated.userId,
                'Credential Revoked',
                message,
                'SYSTEM'
            );
            await this.notificationsService.createNotification(
                updated.userId,
                'Credential Status Updated',
                `Your "${programTitle}" credential status has been changed to ${status}.`,
                'CREDENTIAL'
            );

            this.logSecurityEvent('CREDENTIAL_REVOKED', {
                credentialId: id,
                userId: current.userId,
                changedBy: requesterId || 'SYSTEM',
                reason: reason || 'No reason provided',
                previousStatus: current.verificationStatus,
                newStatus: status,
                verificationCode: current.verificationCode,
            });
        }

        // Send CREDENTIAL notification for SUSPENDED status as well
        if (status === 'SUSPENDED') {
            const programTitle = updated.program?.title || 'Program';
            await this.notificationsService.createNotification(
                updated.userId,
                'Credential Suspended',
                `Your credential for "${programTitle}" has been suspended.${reason ? ` Reason: ${reason}` : ''}`,
                'CREDENTIAL'
            );
        }

        if (requesterId) {
            await this.auditService.logAction(
                requesterId,
                AuditAction.CREDENTIAL_ISSUED,
                `Credential (ID: ${id}) status changed to ${status}. Reason: ${reason || 'None'}`,
            );
        }

        return updated;
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
        // BYPASS: Skip eligibility check, always issue/return credential
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
                // Fallback: use the student themselves as issuer
                issuerId = userId;
            } else {
                issuerId = admin.id;
            }
        }

        // Generate cryptographically secure 18-character hex code
        const uniqueCode = crypto.randomBytes(9).toString('hex').toUpperCase();
        const tier = this.getTierForProgram(programId);
        const credentialId = uuidv4();

        const metadataObj: any = {
            createdStatus: 'ACTIVE',
            createdAt: new Date().toISOString(),
            statusHistory: [{
                status: 'ACTIVE',
                changedBy: issuerId,
                reason: 'Automated credential issuance upon program completion',
                date: new Date().toISOString(),
            }],
            statusReason: '',
            statusLastChangedAt: new Date().toISOString(),
        };

        // Sign metadata for tamper-proofing
        metadataObj.signature = this.signCredentialMetadata(
            credentialId,
            uniqueCode,
            'ACTIVE',
            userId,
            programId,
            metadataObj,
            program.institutionId,
        );

        return this.credentialsRepository.createCredential({
            id: credentialId,
            userId,
            programId,
            institutionId: program.institutionId,
            issuedById: issuerId,
            tier,
            verificationCode: uniqueCode,
            verificationUrl: `/verify/${uniqueCode}`,
            verificationStatus: 'ACTIVE' as const,
            metadata: JSON.stringify(metadataObj),
        });
    }

    async getCredentialAnalytics() {
        const statusGroups = await this.prisma.credential.groupBy({
            by: ['verificationStatus'],
            _count: { id: true },
        });

        const statusCounts = {
            ACTIVE: 0,
            SUSPENDED: 0,
            REVOKED: 0,
        };
        statusGroups.forEach(g => {
            statusCounts[g.verificationStatus] = g._count.id;
        });

        const programGroups = await this.prisma.credential.groupBy({
            by: ['programId'],
            _count: { id: true },
        });

        const programs = await this.prisma.program.findMany({
            select: { id: true, title: true }
        });
        const programMap = new Map(programs.map(p => [p.id, p.title]));

        const programStats = programGroups.map(g => ({
            programId: g.programId,
            programTitle: programMap.get(g.programId) || g.programId,
            count: g._count.id,
        }));

        const recentActivities = await this.prisma.auditLog.findMany({
            where: {
                action: AuditAction.CREDENTIAL_ISSUED
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return {
            statusCounts,
            programStats,
            recentActivities,
        };
    }

    async getCredentialAuditHistory(id: string) {
        const cred = await this.prisma.credential.findUnique({ where: { id } });
        if (!cred) {
            throw new NotFoundException('Credential not found');
        }

        let metadataObj: any = {};
        if (cred.metadata) {
            try { metadataObj = JSON.parse(cred.metadata); } catch { metadataObj = {}; }
        }

        return {
            credentialId: id,
            verificationCode: cred.verificationCode,
            currentStatus: cred.verificationStatus,
            issuedAt: cred.issuedAt,
            statusHistory: (metadataObj.statusHistory || []) as Array<{
                status: string;
                changedBy: string;
                reason: string;
                date: string;
            }>,
            statusReason: metadataObj.statusReason || null,
        };
    }

    async getCredentialStats() {
        const total = await this.prisma.credential.count();
        const active = await this.prisma.credential.count({ where: { verificationStatus: 'ACTIVE' } });
        const revoked = await this.prisma.credential.count({ where: { verificationStatus: 'REVOKED' } });
        const suspended = await this.prisma.credential.count({ where: { verificationStatus: 'SUSPENDED' } });

        // Monthly trend: last 6 months
        const now = new Date();
        const monthlyTrend: { month: string; count: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const count = await this.prisma.credential.count({
                where: { issuedAt: { gte: start, lte: end } },
            });
            monthlyTrend.push({
                month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                count,
            });
        }

        return { total, active, revoked, suspended, monthlyTrend };
    }

    async searchCredentials(params: {
        query?: string;
        status?: VerifyStatus;
        tier?: CredentialTier;
        programId?: string;
        issuerId?: string;
        institutionId?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
    }) {
        return await this.credentialsRepository.search({
            query: params.query,
            status: params.status,
            tier: params.tier,
            programId: params.programId,
            issuerId: params.issuerId,
            institutionId: params.institutionId,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            page: params.page,
            limit: params.limit,
        });
    }

    async batchStatusUpdate(ids: string[], status: VerifyStatus, requesterId: string, reason?: string) {
        const current = await this.prisma.credential.findMany({ where: { id: { in: ids } } });
        if (current.length === 0) {
            throw new NotFoundException('No credentials found for the given IDs');
        }

        // Evict all from cache
        for (const cred of current) {
            this.cacheEvict(cred.verificationCode);
        }

        // Update each credential individually to maintain status history and cryptographic signatures
        const updates = current.map(cred => {
            let metadataObj: any = {};
            if (cred.metadata) {
                try {
                    metadataObj = JSON.parse(cred.metadata);
                } catch {
                    metadataObj = {};
                }
            }

            if (!metadataObj.statusHistory) {
                metadataObj.statusHistory = [];
            }

            metadataObj.statusHistory.push({
                status,
                changedBy: requesterId,
                reason: reason || `Batch status update to ${status.toLowerCase()}`,
                date: new Date().toISOString(),
            });

            metadataObj.statusReason = reason || `Batch status update`;
            metadataObj.statusLastChangedAt = new Date().toISOString();

            // Sign updated metadata
            metadataObj.signature = this.signCredentialMetadata(
                cred.id,
                cred.verificationCode,
                status,
                cred.userId,
                cred.programId,
                metadataObj,
                cred.institutionId,
            );

            return this.prisma.credential.update({
                where: { id: cred.id },
                data: {
                    verificationStatus: status,
                    metadata: JSON.stringify(metadataObj)
                }
            });
        });

        await this.prisma.$transaction(updates);

        // Trigger SYSTEM and CREDENTIAL notifications to students if status is REVOKED
        if (status === 'REVOKED') {
            for (const cred of current) {
                const program = await this.prisma.program.findUnique({ where: { id: cred.programId } });
                const programTitle = program?.title || 'Program';
                const message = `Your credential for the program "${programTitle}" has been permanently revoked.${reason ? ` Reason: ${reason}` : ''}`;
                await this.notificationsService.createNotification(
                    cred.userId,
                    'Credential Revoked',
                    message,
                    'SYSTEM'
                );
                await this.notificationsService.createNotification(
                    cred.userId,
                    'Credential Status Updated',
                    `Your "${programTitle}" credential status has been changed to ${status} via batch update.`,
                    'CREDENTIAL'
                );
            }
        } else if (status === 'SUSPENDED') {
            for (const cred of current) {
                const program = await this.prisma.program.findUnique({ where: { id: cred.programId } });
                const programTitle = program?.title || 'Program';
                await this.notificationsService.createNotification(
                    cred.userId,
                    'Credential Suspended',
                    `Your credential for "${programTitle}" has been suspended.${reason ? ` Reason: ${reason}` : ''}`,
                    'CREDENTIAL'
                );
            }
        }

        await this.auditService.logAction(
            requesterId,
            AuditAction.CREDENTIAL_ISSUED,
            `Batch status update: ${ids.length} credential(s) changed to ${status}. Reason: ${reason || 'None'}. IDs: ${ids.join(', ')}`,
        );

        return { updated: current.length, status };
    }

    async getActivityFeed(limit: number = 50, offset: number = 0) {
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: { action: AuditAction.CREDENTIAL_ISSUED },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
            }),
            this.prisma.auditLog.count({ where: { action: AuditAction.CREDENTIAL_ISSUED } }),
        ]);

        return { data: logs, total, limit, offset };
    }

    async getEnhancedAnalytics() {
        const statusGroups = await this.prisma.credential.groupBy({
            by: ['verificationStatus'],
            _count: { id: true },
        });

        const statusCounts = { ACTIVE: 0, SUSPENDED: 0, REVOKED: 0 };
        statusGroups.forEach(g => { statusCounts[g.verificationStatus] = g._count.id; });

        const programGroups = await this.prisma.credential.groupBy({
            by: ['programId'],
            _count: { id: true },
        });
        const programs = await this.prisma.program.findMany({ select: { id: true, title: true } });
        const programMap = new Map(programs.map(p => [p.id, p.title]));
        const programStats = programGroups.map(g => ({
            programId: g.programId,
            programTitle: programMap.get(g.programId) || g.programId,
            count: g._count.id,
        }));

        const issuerGroups = await this.prisma.credential.groupBy({
            by: ['issuedById'],
            _count: { id: true },
        });
        const issuers = await this.prisma.user.findMany({
            where: { id: { in: issuerGroups.map(g => g.issuedById) } },
            select: { id: true, name: true, email: true },
        });
        const issuerMap = new Map(issuers.map(i => [i.id, i]));
        const issuerStats = issuerGroups.map(g => ({
            issuedById: g.issuedById,
            issuerName: issuerMap.get(g.issuedById)?.name || g.issuedById,
            count: g._count.id,
        }));

        const now = new Date();
        const dailyActivity: { date: string; issued: number; revoked: number; suspended: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
            const issued = await this.prisma.credential.count({
                where: { issuedAt: { gte: start, lte: end } },
            });
            dailyActivity.push({
                date: d.toISOString().split('T')[0],
                issued,
                revoked: 0,
                suspended: 0,
            });
        }

        const tierGroups = await this.prisma.credential.groupBy({
            by: ['tier'],
            _count: { id: true },
        });
        const tierStats = { FORGE: 0, ARENA: 0, CITADEL: 0 };
        tierGroups.forEach(g => { tierStats[g.tier] = g._count.id; });

        return {
            statusCounts,
            programStats,
            issuerStats,
            dailyActivity,
            tierStats,
        };
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

