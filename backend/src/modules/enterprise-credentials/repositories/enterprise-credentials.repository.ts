import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, $Enums } from '@prisma/client';

export interface EnterpriseCredentialSearchParams {
    query?: string;
    status?: $Enums.VerifyStatus;
    track?: $Enums.ComplianceTrack;
    employeeId?: string;
    organizationId?: string;
    departmentId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class EnterpriseCredentialsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.EnterpriseCredentialUncheckedCreateInput) {
        return await this.prisma.enterpriseCredential.create({
            data,
            include: {
                employee: { include: { user: true } },
                organization: true,
                complianceAssessment: true,
                template: true,
            }
        });
    }

    async findById(id: string) {
        return await this.prisma.enterpriseCredential.findUnique({
            where: { id },
            include: {
                employee: { include: { user: true, department: true } },
                organization: true,
                complianceAssessment: true,
                template: true,
            }
        });
    }

    async findByVerificationCode(code: string) {
        return await this.prisma.enterpriseCredential.findUnique({
            where: { verificationCode: code },
            include: {
                employee: { include: { user: true, department: true } },
                organization: true,
                complianceAssessment: true,
                template: true,
            }
        });
    }

    async findByEmployeeId(employeeId: string) {
        return await this.prisma.enterpriseCredential.findMany({
            where: { employeeId },
            include: {
                organization: true,
                complianceAssessment: true,
                template: true,
            },
            orderBy: { issuedAt: 'desc' },
        });
    }

    async updateStatus(id: string, status: $Enums.VerifyStatus) {
        return await this.prisma.enterpriseCredential.update({
            where: { id },
            data: { verificationStatus: status },
            include: {
                employee: { include: { user: true } },
                organization: true,
            }
        });
    }

    async batchUpdateStatus(ids: string[], status: $Enums.VerifyStatus) {
        return await this.prisma.enterpriseCredential.updateMany({
            where: { id: { in: ids } },
            data: { verificationStatus: status },
        });
    }

    async search(params: EnterpriseCredentialSearchParams) {
        const where: Prisma.EnterpriseCredentialWhereInput = {};
        const andConditions: Prisma.EnterpriseCredentialWhereInput[] = [];

        if (params.organizationId) {
            andConditions.push({ organizationId: params.organizationId });
        }

        if (params.employeeId) {
            andConditions.push({ employeeId: params.employeeId });
        }

        if (params.status) {
            andConditions.push({ verificationStatus: params.status });
        }

        if (params.track) {
            andConditions.push({ complianceTrack: params.track });
        }

        if (params.departmentId) {
            andConditions.push({
                employee: {
                    departmentId: params.departmentId
                }
            });
        }

        if (params.query) {
            andConditions.push({
                OR: [
                    { verificationCode: { contains: params.query, mode: 'insensitive' } },
                    { employee: { user: { name: { contains: params.query, mode: 'insensitive' } } } },
                    { employee: { user: { email: { contains: params.query, mode: 'insensitive' } } } },
                    { employee: { title: { contains: params.query, mode: 'insensitive' } } },
                ]
            });
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
            this.prisma.enterpriseCredential.findMany({
                where,
                include: {
                    employee: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                            department: true,
                        }
                    },
                    organization: true,
                    complianceAssessment: true,
                    template: true,
                },
                orderBy: { issuedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.enterpriseCredential.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getAnalytics(organizationId: string) {
        const [active, revoked, suspended, tracksCount] = await Promise.all([
            this.prisma.enterpriseCredential.count({ where: { organizationId, verificationStatus: 'ACTIVE' } }),
            this.prisma.enterpriseCredential.count({ where: { organizationId, verificationStatus: 'REVOKED' } }),
            this.prisma.enterpriseCredential.count({ where: { organizationId, verificationStatus: 'SUSPENDED' } }),
            this.prisma.enterpriseCredential.groupBy({
                by: ['complianceTrack'],
                where: { organizationId },
                _count: { id: true },
            }),
        ]);

        const trackStats = tracksCount.reduce((acc, current) => {
            acc[current.complianceTrack] = current._count.id;
            return acc;
        }, {} as Record<string, number>);

        return {
            statusCounts: { ACTIVE: active, REVOKED: revoked, SUSPENDED: suspended },
            trackStats,
            total: active + revoked + suspended,
        };
    }
}
