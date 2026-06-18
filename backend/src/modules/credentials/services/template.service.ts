import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CredentialType } from '@prisma/client';

@Injectable()
export class TemplateService {
    constructor(private readonly prisma: PrismaService) { }

    async getTemplatesByType(type: CredentialType) {
        return await this.prisma.credentialTemplate.findMany({
            where: { type: type }
        });
    }

    async getTemplateById(id: string) {
        return await this.prisma.credentialTemplate.findUnique({
            where: { id: id }
        });
    }

    async getAllTemplates() {
        return await this.prisma.credentialTemplate.findMany();
    }
}
