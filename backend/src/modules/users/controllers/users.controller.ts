import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { XpService } from '../services/xp.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly xpService: XpService,
  ) {}

  /**
   * GET /api/users/faculty/profile
   * Returns the authenticated faculty member's full profile:
   * name, email, institution, department, designation, verificationStatus.
   * Protected — FACULTY only.
   */
  @Get('faculty/profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY)
  async getFacultyProfile(@Req() req) {
    return this.usersService.getFacultyProfile(req.user.id);
  }

  /**
   * GET /api/users/faculty/dashboard
   * Returns dashboard statistics for the authenticated faculty member:
   * totalPrograms, totalStudents, pendingAttempts, verificationStatus.
   * Protected — FACULTY only.
   */
  @Get('faculty/dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY)
  async getFacultyDashboard(@Req() req) {
    return this.usersService.getFacultyDashboardStats(req.user.id);
  }

  /**
   * GET /api/users/me/xp
   * Get the authenticated user's XP total and streak.
   */
  @Get('me/xp')
  async getMyXp(@Req() req) {
    const details = await this.xpService.getUserXpDetails(req.user.id);
    return { success: true, ...details };
  }
}
