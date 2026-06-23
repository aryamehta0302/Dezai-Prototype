import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserRole, AuditAction } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { hashPassword, verifyPassword } from '../utils/password.utils';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  /**
   * Complete onboarding for an authenticated user by saving/updating
   * their profile and selected role in the database.
   *
   * For FACULTY role: institutionId, department, and designation are required.
   */
  async onboardUser(
    userPayload: { id: string; email: string; name: string },
    role: UserRole,
    options?: {
      institutionId?: string;
      department?: string;
      designation?: string;
    },
  ) {
    const { id: userId, email, name } = userPayload;

    // 1. Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 2. User doesn't exist, create them
      user = await this.prisma.user.create({
        data: {
          id: userId,
          email,
          name,
          role,
          onboarded: true,
        },
      });
    } else {
      // 3. User exists, update role
      user = await this.prisma.user.update({
        where: { email },
        data: {
          role,
          onboarded: true,
        },
      });
    }

    // 4. Create role-specific relations
    if (role === UserRole.FACULTY) {
      const existingFaculty = await this.prisma.facultyMember.findUnique({
        where: { userId: user.id },
      });
      if (!existingFaculty) {
        // If no institutionId provided, fall back to the first institution (dev/demo safety)
        let institutionId = options?.institutionId;
        if (!institutionId) {
          const defaultInst = await this.getOrCreateDefaultInstitution();
          institutionId = defaultInst.id;
        }
        await this.prisma.facultyMember.create({
          data: {
            userId: user.id,
            institutionId,
            department: options?.department ?? null,
            designation: options?.designation ?? null,
            // verificationStatus defaults to PENDING via schema
          },
        });
      } else {
        // Update existing faculty record with latest details
        await this.prisma.facultyMember.update({
          where: { userId: user.id },
          data: {
            institutionId: options?.institutionId ?? existingFaculty.institutionId,
            department: options?.department ?? existingFaculty.department,
            designation: options?.designation ?? existingFaculty.designation,
          },
        });
      }
    } else if (role === UserRole.UNIVERSITY_ADMIN) {
      const existingAdmin = await this.prisma.institutionAdmin.findUnique({
        where: { userId: user.id },
      });
      if (!existingAdmin) {
        const institutionId = options?.institutionId;
        let resolvedInstitutionId = institutionId;
        if (!resolvedInstitutionId) {
          const defaultInst = await this.getOrCreateDefaultInstitution();
          resolvedInstitutionId = defaultInst.id;
        }
        await this.prisma.institutionAdmin.create({
          data: {
            userId: user.id,
            institutionId: resolvedInstitutionId,
          },
        });
      }
    }

    // Log role change audit action
    await this.auditService.logAction(
      user.id,
      AuditAction.ROLE_CHANGED,
      `User ${user.email} onboarded with role ${role}`,
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboarded: true,
      },
    };
  }

  /**
   * Helper to ensure at least one default institution exists in the database
   * so that Faculty and University Admins can be linked properly.
   */
  private async getOrCreateDefaultInstitution() {
    let inst = await this.prisma.institution.findFirst();
    if (!inst) {
      inst = await this.prisma.institution.create({
        data: {
          name: 'Dezai Technical University',
          description: 'Default institution for V1 demonstration and development.',
        },
      });
    }
    return inst;
  }

  /**
   * Register a new user with credentials.
   */
  async registerUser(data: { email: string; name: string; password: string }) {
    const { email, name, password } = data;

    // 1. Verify if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('User with this email already exists.');
    }

    // 2. Hash password and create user
    const passwordHash = hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: UserRole.STUDENT,
        onboarded: false,
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboarded: user.onboarded,
      },
    };
  }

  /**
   * Authenticate user with credentials.
   */
  async authenticateUser(data: { email: string; password: string }) {
    const { email, password } = data;

    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // 2. Verify password hash
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboarded: user.onboarded,
      },
    };
  }

  /**
   * Sync/retrieve session status for social logins.
   */
  async syncSession(data: { id: string; email: string; name: string }) {
    const { id, email, name } = data;

    // Look up by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If user does not exist, they need to onboard
    if (!user) {
      return {
        success: true,
        user: {
          id,
          email,
          name,
          role: UserRole.STUDENT,
          onboarded: false,
        },
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboarded: user.onboarded,
      },
    };
  }
}
