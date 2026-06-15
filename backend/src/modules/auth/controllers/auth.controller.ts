import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserRole, AuditAction } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';

export class OnboardUserDto {
  role: UserRole;
}

export class RegisterUserDto {
  email: string;
  name: string;
  password?: string;
}

export class LoginUserDto {
  email: string;
  password?: string;
}

export class SessionSyncDto {
  id: string;
  email: string;
  name: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService
  ) {}

  /**
   * POST /api/auth/onboarding
   * Finalizes user signup and registers their selected workspace role.
   */
  @Post('onboarding')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async onboard(@Req() req, @Body() body: OnboardUserDto) {
    const { role } = body;

    if (!role || !Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid or missing UserRole value');
    }

    const userPayload = req.user; // populated by JwtAuthGuard
    return this.authService.onboardUser(userPayload, role);
  }

  /**
   * POST /api/auth/login-audit
   * Tracks user logins from the client application.
   */
  @Post('login-audit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async loginAudit(@Req() req) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    await this.auditService.logAction(
      req.user.id,
      AuditAction.LOGIN,
      `User ${req.user.email} logged in`,
      ipAddress
    );
    return { success: true };
  }
  /**
   * POST /api/auth/register
   * Registers a user via email and password credentials.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto) {
    const { email, name, password } = body;
    if (!email || !name || !password) {
      throw new BadRequestException('Email, name, and password are required.');
    }
    return this.authService.registerUser({ email, name, password });
  }

  /**
   * POST /api/auth/login
   * Authenticates a user credentials (used by NextAuth flow).
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginUserDto) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }
    return this.authService.authenticateUser({ email, password });
  }

  /**
   * POST /api/auth/session-sync
   * Validates or synchronizes session payload for OAuth social logins.
   */
  @Post('session-sync')
  @HttpCode(HttpStatus.OK)
  async sessionSync(@Body() body: SessionSyncDto) {
    const { id, email, name } = body;
    if (!id || !email || !name) {
      throw new BadRequestException('User metadata is required.');
    }
    return this.authService.syncSession({ id, email, name });
  }
}
