import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LeaderboardsService } from '../services/leaderboards.service';
import {
  StudentLeaderboardResponseDto,
  UniversityLeaderboardResponseDto,
  ProgramLeaderboardResponseDto,
  StudentWidgetResponseDto,
  FacultyWidgetResponseDto,
} from '../dto/leaderboard.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * LeaderboardsController
 *
 * Exposes five leaderboard endpoints under /api/leaderboards/
 * All routes are protected by JWT authentication.
 *
 * Dezai Terminology:
 *   - Program     (not Course)
 *   - Institution (not College)
 *   - Enrollment  (not Registration)
 *
 * Routes:
 *   GET /api/leaderboards/students             — student ranking (weekly/monthly/all)
 *   GET /api/leaderboards/universities         — institution ranking by total XP
 *   GET /api/leaderboards/programs             — program ranking by total XP
 *   GET /api/leaderboards/widgets/student      — compact widget for student dashboard
 *   GET /api/leaderboards/widgets/faculty      — compact widget for faculty dashboard
 *
 * Query Parameters:
 *   ?range=weekly|monthly|all  (students only — defaults to 'all')
 *   ?limit=N                   (all endpoints — clamped to [1, 100], defaults vary)
 *   ?programId=<uuid>          (faculty widget only — pins to a specific program)
 *
 * Limit parsing:
 *   Query params arrive as strings. parseInt(limit, 10) is called before
 *   passing to the service. NaN falls back to the service-side default.
 */
@Controller('leaderboards')
@UseGuards(JwtAuthGuard)
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  /**
   * GET /api/leaderboards/students
   *
   * Returns a ranked list of students by XP within the selected time range.
   *
   * Query Parameters:
   *   ?range=weekly   — XP earned in the last 7 days (via XpTransaction.createdAt)
   *   ?range=monthly  — XP earned in the last 30 days (via XpTransaction.createdAt)
   *   ?range=all      — (default) All-time XP from User.xp
   *   ?limit=N        — Max entries to return (default: 50, max: 100)
   *
   * Response: { success: true, data: StudentLeaderboardResponseDto }
   */
  @Get('students')
  async getStudentLeaderboard(
    @Query('range') range: string = 'all',
    @Query('limit') limit: string = '50',
  ): Promise<{ success: boolean; data: StudentLeaderboardResponseDto }> {
    const parsedLimit = parseInt(limit, 10) || 50;
    const data = await this.leaderboardsService.getStudentLeaderboard(
      range,
      parsedLimit,
    );
    return { success: true, data };
  }

  /**
   * GET /api/leaderboards/universities
   *
   * Returns institutions ranked by total XP of all their enrolled students.
   * Includes active student count (last 30 days) and fastest completion (days).
   *
   * Query Parameters:
   *   ?limit=N  — Max entries to return (default: 20, max: 100)
   *
   * Response: { success: true, data: UniversityLeaderboardResponseDto }
   */
  @Get('universities')
  async getUniversityLeaderboard(
    @Query('limit') limit: string = '20',
  ): Promise<{ success: boolean; data: UniversityLeaderboardResponseDto }> {
    const parsedLimit = parseInt(limit, 10) || 20;
    const data = await this.leaderboardsService.getUniversityLeaderboard(
      parsedLimit,
    );
    return { success: true, data };
  }

  /**
   * GET /api/leaderboards/programs
   *
   * Returns programs ranked by total XP of all enrolled students.
   * Includes active student count (last 30 days) and fastest completion (days).
   *
   * Query Parameters:
   *   ?limit=N  — Max entries to return (default: 20, max: 100)
   *
   * Response: { success: true, data: ProgramLeaderboardResponseDto }
   */
  @Get('programs')
  async getProgramLeaderboard(
    @Query('limit') limit: string = '20',
  ): Promise<{ success: boolean; data: ProgramLeaderboardResponseDto }> {
    const parsedLimit = parseInt(limit, 10) || 20;
    const data = await this.leaderboardsService.getProgramLeaderboard(
      parsedLimit,
    );
    return { success: true, data };
  }

  /**
   * GET /api/leaderboards/widgets/student
   *
   * Compact leaderboard widget for the student dashboard.
   * Returns top-N students by all-time XP, marking the requesting user.
   * Also returns the current user's rank even if they are outside the top-N.
   *
   * Query Parameters:
   *   ?limit=N  — Top-N entries to show (default: 5, max: 100)
   *
   * Response: { success: true, data: StudentWidgetResponseDto }
   */
  @Get('widgets/student')
  async getStudentWidget(
    @Req() req,
    @Query('limit') limit: string = '5',
  ): Promise<{ success: boolean; data: StudentWidgetResponseDto }> {
    const parsedLimit = parseInt(limit, 10) || 5;
    const data = await this.leaderboardsService.getStudentWidget(
      req.user.id,
      parsedLimit,
    );
    return { success: true, data };
  }

  /**
   * GET /api/leaderboards/widgets/faculty
   *
   * Compact leaderboard widget for the faculty dashboard.
   * Returns top-N students ranked by XP within the faculty's program.
   * Scoped to the faculty's most recently created program by default.
   * Pin to a specific program using ?programId=<uuid>.
   *
   * Roles: FACULTY, UNIVERSITY_ADMIN, DEZAI_ADMIN only.
   *
   * Query Parameters:
   *   ?limit=N          — Top-N entries (default: 5, max: 100)
   *   ?programId=<uuid> — Optional: pin to a specific program
   *
   * Response: { success: true, data: FacultyWidgetResponseDto }
   */
  @Get('widgets/faculty')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getFacultyWidget(
    @Req() req,
    @Query('limit') limit: string = '5',
    @Query('programId') programId?: string,
  ): Promise<{ success: boolean; data: FacultyWidgetResponseDto }> {
    const parsedLimit = parseInt(limit, 10) || 5;
    const data = await this.leaderboardsService.getFacultyWidget(
      req.user.id,
      parsedLimit,
      programId,
    );
    return { success: true, data };
  }
}
