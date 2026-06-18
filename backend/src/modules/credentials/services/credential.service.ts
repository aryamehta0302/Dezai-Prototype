import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { UserRole, AuditAction, VerifyStatus } from "@prisma/client";
import { AuditService } from "../../audit/services/audit.service";
import {
  IssueCredentialDto,
  UpdateCredentialDto,
} from "../dto/credential.dto";

@Injectable()
export class CredentialService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─────────────────── VERIFICATION CODE GENERATION ───────────────────

  /**
   * Generates a unique verification code in the format DZ-XXXX-XXXX.
   * Uses a while loop to ensure uniqueness against existing credentials.
   */
  private async generateVerificationCode(): Promise<string> {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const generateSegment = (length: number): string => {
      let segment = "";
      for (let i = 0; i < length; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return segment;
    };

    let code: string;
    let exists = true;

    while (exists) {
      code = `DZ-${generateSegment(4)}-${generateSegment(4)}`;
      const existing = await this.prisma.credential.findUnique({
        where: { verificationCode: code },
      });
      exists = !!existing;
    }

    return code!;
  }

  // ─────────────────── ISSUE CREDENTIAL ───────────────────

  async issueCredential(issuerId: string, dto: IssueCredentialDto) {
    const verificationCode = await this.generateVerificationCode();
    const verificationUrl = `https://dezai.io/verify/${verificationCode}`;

    const credential = await this.prisma.credential.create({
      data: {
        userId: dto.userId,
        programId: dto.programId,
        institutionId: dto.institutionId,
        issuedById: issuerId,
        tier: dto.tier,
        verificationCode,
        verificationUrl,
        metadata: dto.metadata,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
        institution: { select: { id: true, name: true } },
        issuer: { select: { id: true, name: true } },
      },
    });

    await this.auditService.logAction(
      issuerId,
      AuditAction.CREDENTIAL_ISSUED,
      `Credential "${credential.verificationCode}" (ID: ${credential.id}) issued to user ${dto.userId} for program ${dto.programId}`,
    );

    return credential;
  }

  // ─────────────────── GET CREDENTIALS BY USER ───────────────────

  async getCredentialsByUser(userId: string) {
    return this.prisma.credential.findMany({
      where: { userId },
      include: {
        program: { select: { id: true, title: true } },
        institution: { select: { id: true, name: true } },
      },
      orderBy: { issuedAt: "desc" },
    });
  }

  // ─────────────────── GET CREDENTIAL BY ID ───────────────────

  async getCredentialById(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
        institution: { select: { id: true, name: true } },
        issuer: { select: { id: true, name: true } },
      },
    });

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    // Students can only see their own credentials
    if (
      requesterRole === UserRole.STUDENT &&
      credential.userId !== requesterId
    ) {
      throw new ForbiddenException(
        "Unauthorized: You can only view your own credentials",
      );
    }

    return credential;
  }

  // ─────────────────── PUBLIC VERIFICATION ───────────────────

  async verifyByCode(code: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { verificationCode: code },
      select: {
        id: true,
        tier: true,
        verificationCode: true,
        verificationUrl: true,
        verificationStatus: true,
        issuedAt: true,
        metadata: true,
        user: { select: { name: true } },
        program: { select: { title: true, description: true } },
        institution: { select: { name: true, logoUrl: true } },
      },
    });

    if (!credential) {
      throw new NotFoundException(
        `Credential with verification code ${code} not found`,
      );
    }

    return credential;
  }

  // ─────────────────── UPDATE CREDENTIAL ───────────────────

  async updateCredential(
    id: string,
    dto: UpdateCredentialDto,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    // Only DEZAI_ADMIN and UNIVERSITY_ADMIN (with matching institution) can update
    if (requesterRole === UserRole.DEZAI_ADMIN) {
      // DEZAI_ADMIN bypasses all ownership checks
    } else if (requesterRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId: requesterId },
      });
      if (!admin || admin.institutionId !== credential.institutionId) {
        throw new ForbiddenException(
          "Unauthorized: Admin institution mismatch",
        );
      }
    } else {
      throw new ForbiddenException("Unauthorized role");
    }

    return this.prisma.credential.update({
      where: { id },
      data: { metadata: dto.metadata },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
        institution: { select: { id: true, name: true } },
        issuer: { select: { id: true, name: true } },
      },
    });
  }

  // ─────────────────── UPDATE STATUS ───────────────────

  async updateStatus(
    id: string,
    status: VerifyStatus,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    if (requesterRole === UserRole.DEZAI_ADMIN) {
      // DEZAI_ADMIN bypasses all ownership checks
    } else if (requesterRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId: requesterId },
      });
      if (!admin || admin.institutionId !== credential.institutionId) {
        throw new ForbiddenException(
          "Unauthorized: Admin institution mismatch",
        );
      }
    } else {
      throw new ForbiddenException("Unauthorized role");
    }

    return this.prisma.credential.update({
      where: { id },
      data: { verificationStatus: status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
        institution: { select: { id: true, name: true } },
        issuer: { select: { id: true, name: true } },
      },
    });
  }

  // ─────────────────── DELETE CREDENTIAL ───────────────────

  async deleteCredential(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    if (requesterRole !== UserRole.DEZAI_ADMIN) {
      throw new ForbiddenException(
        "Unauthorized: Only DEZAI_ADMIN can delete credentials",
      );
    }

    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    await this.prisma.credential.delete({ where: { id } });

    await this.auditService.logAction(
      requesterId,
      AuditAction.CREDENTIAL_ISSUED,
      `Credential "${credential.verificationCode}" (ID: ${credential.id}) deleted by DEZAI_ADMIN`,
    );
  }

  // ─────────────────── GET CREDENTIALS BY PROGRAM ───────────────────

  async getCredentialsByProgram(programId: string) {
    return this.prisma.credential.findMany({
      where: { programId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        institution: { select: { id: true, name: true } },
      },
    });
  }
}
