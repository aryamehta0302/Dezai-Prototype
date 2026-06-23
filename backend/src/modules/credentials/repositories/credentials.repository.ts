import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, $Enums } from '@prisma/client';

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
}