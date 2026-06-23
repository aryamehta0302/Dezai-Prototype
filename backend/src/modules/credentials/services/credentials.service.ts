import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CredentialTier, VerifyStatus } from '@prisma/client';

@Injectable()
export class CredentialsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Maps a program/course ID to a CredentialTier
   */
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

  /**
   * Helper to generate unique verification code: DZA-[Year]-[UnivAbbr]-[RandomHex]
   */
  private async generateVerificationCode(institutionName: string): Promise<string> {
    const year = new Date().getFullYear();
    const cleanUnivName = institutionName
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 4)
      .toUpperCase();
    
    let isUnique = false;
    let code = '';
    
    while (!isUnique) {
      const randVal = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
      code = `DZA-${year}-${cleanUnivName}-${randVal}`;
      
      const existing = await this.prisma.credential.findUnique({
        where: { verificationCode: code },
      });
      if (!existing) {
        isUnique = true;
      }
    }
    
    return code;
  }

  /**
   * Check if a student is eligible for a credential in a program.
   * Student is eligible if:
   * 1. Has completed all lessons (progress >= 100% or completedAt is set)
   * 2. Has passed all assessments in the program's tracks
   */
  async checkEligibility(userId: string, programId: string): Promise<{ eligible: boolean; reason?: string }> {
    // 1. Fetch the program along with tracks, modules, and assessments
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        tracks: {
          include: {
            modules: {
              include: {
                assessments: true,
              },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    // 2. Fetch the enrollment status
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_programId: { userId, programId } },
    });

    if (!enrollment) {
      return { eligible: false, reason: 'Student is not enrolled in this program' };
    }

    if (enrollment.progress < 100 && !enrollment.completedAt) {
      return { eligible: false, reason: `Program completion is at ${enrollment.progress}%. All lessons must be completed.` };
    }

    // 3. Extract all assessments in this program
    const assessments = program.tracks.flatMap((track) =>
      track.modules.flatMap((module) => module.assessments)
    );

    if (assessments.length === 0) {
      // If there are no assessments, progress is enough
      return { eligible: true };
    }

    // 4. Check if student has passed each assessment
    for (const assessment of assessments) {
      const passedAttempt = await this.prisma.assessmentAttempt.findFirst({
        where: {
          userId,
          assessmentId: assessment.id,
          passed: true,
        },
      });

      if (!passedAttempt) {
        return {
          eligible: false,
          reason: `Assessment "${assessment.title}" has not been passed yet.`,
        };
      }
    }

    return { eligible: true };
  }

  /**
   * Issue credential for a program
   */
  async issueCredential(userId: string, programId: string) {
    // 1. Check eligibility first
    const { eligible, reason } = await this.checkEligibility(userId, programId);
    if (!eligible) {
      throw new BadRequestException(reason || 'Student is not eligible for this credential.');
    }

    // 2. Check if already issued
    const existing = await this.prisma.credential.findFirst({
      where: { userId, programId },
    });

    if (existing) {
      return existing;
    }

    // 3. Fetch program, institution, and faculty details
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        institution: true,
        faculty: true,
        tracks: {
          include: {
            modules: {
              include: {
                assessments: true,
              },
            },
          },
        },
      },
    });


    if (!program) {
      throw new NotFoundException(`Program ${programId} not found`);
    }

    // Determine issuer user ID.
    // If program has faculty with userId, use it.
    // Otherwise fallback to any administrator user.
    let issuerId = program.faculty?.userId;
    if (!issuerId) {
      const admin = await this.prisma.user.findFirst({
        where: { role: 'DEZAI_ADMIN' },
      });
      if (!admin) {
        throw new NotFoundException('No issuer or administrator found to sign the credential.');
      }
      issuerId = admin.id;
    }

    const verificationCode = await this.generateVerificationCode(program.institution.name);
    // Verification URL pointing to frontend verification portal
    const verificationUrl = `/verify/${verificationCode}`;
    const tier = this.getTierForProgram(programId);

    // Get score from the passed attempts (average or highest)
    const assessments = program.tracks.flatMap((track) =>
      track.modules.flatMap((module) => module.assessments)
    );

    let totalScore = 0;
    let assessmentCount = 0;
    for (const assessment of assessments) {
      const attempt = await this.prisma.assessmentAttempt.findFirst({
        where: { userId, assessmentId: assessment.id, passed: true },
        orderBy: { score: 'desc' },
      });
      if (attempt) {
        totalScore += attempt.score;
        assessmentCount++;
      }
    }

    const avgScore = assessmentCount > 0 ? Math.round(totalScore / assessmentCount) : 100;
    const grade = avgScore >= 95 ? 'A+' : avgScore >= 85 ? 'A' : avgScore >= 75 ? 'B+' : 'B';

    const metadataObj = {
      score: avgScore,
      grade,
      instructorName: program.faculty
        ? (await this.prisma.user.findUnique({ where: { id: program.faculty.userId } }))?.name || 'Faculty Member'
        : 'Dezai Faculty Panel',
    };

    return this.prisma.credential.create({
      data: {
        userId,
        programId,
        institutionId: program.institutionId,
        issuedById: issuerId,
        tier,
        verificationCode,
        verificationUrl,
        verificationStatus: VerifyStatus.ACTIVE,
        metadata: JSON.stringify(metadataObj),
      },
      include: {
        program: {
          include: {
            institution: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        issuer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Verify credential by code
   */
  async verifyCredential(code: string) {
    const cred = await this.prisma.credential.findUnique({
      where: { verificationCode: code },
      include: {
        program: {
          include: {
            institution: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        issuer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!cred) {
      throw new NotFoundException('Credential verification record not found');
    }

    return cred;
  }

  /**
   * Get student credentials
   */
  async getStudentCredentials(userId: string) {
    return this.prisma.credential.findMany({
      where: { userId },
      include: {
        program: {
          include: {
            institution: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        issuer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  /**
   * Get details of a single credential by ID
   */
  async getCredentialDetails(id: string) {
    let cred = await this.prisma.credential.findUnique({
      where: { id },
      include: {
        program: {
          include: {
            institution: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        issuer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!cred) {
      cred = await this.prisma.credential.findUnique({
        where: { verificationCode: id },
        include: {
          program: {
            include: {
              institution: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          issuer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    if (!cred) {
      throw new NotFoundException('Credential record not found');
    }

    return cred;
  }
}
