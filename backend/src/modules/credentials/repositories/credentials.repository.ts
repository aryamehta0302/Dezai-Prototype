import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, $Enums } from '@prisma/client';

export interface CredentialSearchParams {
    query?: string;
    status?: $Enums.VerifyStatus;
    tier?: $Enums.CredentialTier;
    programId?: string;
    issuerId?: string;
    institutionId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class CredentialsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createCredential(data: Prisma.CredentialUncheckedCreateInput) {
        return await this.prisma.credential.create({ data });
    }

    async findAll() {
        return await this.prisma.credential.findMany({
            include: { user: true, program: true, credentialTemplate: true }
        });
    }

    async findByVerificationCode(code: string) {
        return await this.prisma.credential.findUnique({
            where: { verificationCode: code },
            include: { user: true, program: true, credentialTemplate: true, institution: true }
        });
    }

    async updateStatus(id: string, status: $Enums.VerifyStatus) {
        return await this.prisma.credential.update({
            where: { id },
            data: { verificationStatus: status },
        });
    }

    async findByUserId(userId: string) {
        return await this.prisma.credential.findMany({
            where: { userId },
            include: { program: true, credentialTemplate: true, institution: true }
        });
    }

    async search(params: CredentialSearchParams) {
        const where: Prisma.CredentialWhereInput = {};
        const andConditions: Prisma.CredentialWhereInput[] = [];

        if (params.query) {
            andConditions.push({
                OR: [
                    { verificationCode: { contains: params.query, mode: 'insensitive' } },
                    { user: { name: { contains: params.query, mode: 'insensitive' } } },
                    { user: { email: { contains: params.query, mode: 'insensitive' } } },
                    { program: { title: { contains: params.query, mode: 'insensitive' } } },
                    { id: { contains: params.query, mode: 'insensitive' } },
                ]
            });
        }

        if (params.status) {
            andConditions.push({ verificationStatus: params.status });
        }

        if (params.tier) {
            andConditions.push({ tier: params.tier });
        }

        if (params.programId) {
            andConditions.push({ programId: params.programId });
        }

        if (params.issuerId) {
            andConditions.push({ issuedById: params.issuerId });
        }

        if (params.institutionId) {
            andConditions.push({ institutionId: params.institutionId });
        }

        if (params.dateFrom || params.dateTo) {
            const dateFilter: Prisma.DateTimeFilter = {};
            if (params.dateFrom) {
                dateFilter.gte = new Date(params.dateFrom);
            }
            if (params.dateTo) {
                dateFilter.lte = new Date(params.dateTo + 'T23:59:59.999Z');
            }
            andConditions.push({ issuedAt: dateFilter });
        }

        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        const page = params.page || 1;
        const limit = params.limit || 50;
        const skip = (page - 1) * limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.credential.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    program: true,
                    institution: true,
                    issuer: { select: { id: true, name: true, email: true } },
                    credentialTemplate: true,
                },
                orderBy: { issuedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.credential.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async batchUpdateStatus(ids: string[], status: $Enums.VerifyStatus) {
        return await this.prisma.credential.updateMany({
            where: { id: { in: ids } },
            data: { verificationStatus: status },
        });
    }

    async countByStatusAndDateRange(from: Date, to: Date) {
        const [active, revoked, suspended] = await Promise.all([
            this.prisma.credential.count({ where: { verificationStatus: 'ACTIVE', issuedAt: { gte: from, lte: to } } }),
            this.prisma.credential.count({ where: { verificationStatus: 'REVOKED', issuedAt: { gte: from, lte: to } } }),
            this.prisma.credential.count({ where: { verificationStatus: 'SUSPENDED', issuedAt: { gte: from, lte: to } } }),
        ]);
        return { active, revoked, suspended };
    }
}