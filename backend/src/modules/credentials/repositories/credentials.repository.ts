import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CredentialsRepository {
    constructor(private readonly prisma: PrismaService) { }

    // DB query to create a new credential
    async createCredential(data: any) {
        return await this.prisma.credential.create({
            data: data,
        });
    }

    // Future use: DB query to fetch credentials for faculty dashboard
    async findAll() {
        return await this.prisma.credential.findMany({
            include: { user: true, program: true, credentialTemplate: true }
        });
    }

    // For Verification fatching the verification code 
    async findByVerificationCode(code: string) {
        return await this.prisma.credential.findUnique({
            where: { verificationCode: code },
            include: { user: true, program: true, credentialTemplate: true, institution: true } // Also Fatching the extra details
        });
    }

    // Faculty can update the verification status the base worker
    async updateStatus(id: string, status: any) {
        return await this.prisma.credential.update({
            where: { id: id },
            data: { verificationStatus: status },
        });
    }

    // For the potal finding all student info
    async findByUserId(userId: string) {
        return await this.prisma.credential.findMany({
            where: { userId: userId },
            include: { program: true, credentialTemplate: true, institution: true } //Program with details
        });
    }
}