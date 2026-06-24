import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createCredential(data: Prisma.CredentialCreateInput) {
    return this.prisma.credential.create({ data });
  }

  async findCredentials(params: {
    where?: Prisma.CredentialWhereInput;
    include?: Prisma.CredentialInclude;
  }) {
    return this.prisma.credential.findMany(params);
  }

  async findCredential(where: Prisma.CredentialWhereInput, include?: Prisma.CredentialInclude) {
    return this.prisma.credential.findFirst({ where, include });
  }

  async updateCredential(where: Prisma.CredentialWhereUniqueInput, data: Prisma.CredentialUpdateInput) {
    return this.prisma.credential.update({ where, data });
  }

  async deleteCredential(id: string) {
    return this.prisma.credential.delete({ where: { id } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findFirstUser() {
    return this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
  }

  async findFirstProgram() {
    return this.prisma.program.findFirst();
  }

  async findEnrollment(userId: string, programId: string) {
    return this.prisma.enrollment.findUnique({
      where: { userId_programId: { userId, programId } }
    });
  }

  async findAssessmentAttempt(userId: string, assessmentId: string) {
    return this.prisma.assessmentAttempt.findFirst({
      where: { userId, assessmentId, passed: true },
      orderBy: { score: 'desc' }
    });
  }

  async findCredentialLogs(credentialId: string) {
    return this.prisma.credentialLog.findMany({
      where: { credentialId },
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, name: true, role: true } } }
    });
  }

  async findAllStudentsWithCredentials() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        credentials: {
          include: {
            program: true,
            institution: true
          }
        }
      }
    });
  }
}
