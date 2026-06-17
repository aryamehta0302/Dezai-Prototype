import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
