import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ComplianceTrack } from '@prisma/client';

@Injectable()
export class EnterpriseTemplateService {
    constructor(private readonly prisma: PrismaService) { }

    async getTemplatesByTrack(track: ComplianceTrack) {
        return await this.prisma.enterpriseCredentialTemplate.findMany({
            where: { complianceTrack: track }
        });
    }

    async getTemplateById(id: string) {
        return await this.prisma.enterpriseCredentialTemplate.findUnique({
            where: { id }
        });
    }

    async getAllTemplates(organizationId: string) {
        return await this.prisma.enterpriseCredentialTemplate.findMany({
            where: { organizationId }
        });
    }
}
