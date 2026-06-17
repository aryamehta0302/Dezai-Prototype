import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  AnalyticsService,
  FacultyAnalyticsResponseDto,
  ProgramAnalyticsResponseDto,
  StudentMetricsResponseDto,
} from '../services/analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * AnalyticsController
 *
 * Exposes three analytics endpoints under /api/analytics/
 * All routes are protected by JWT authentication and Role guards.
 *
 * Allowed roles: FACULTY, UNIVERSITY_ADMIN, DEZAI_ADMIN
 *
 * Dezai Terminology used in this controller:
 *   - Program     (not Course)
 *   - Institution (not College)
 *   - Enrollment  (not Registration)
 *
 * Routes:
 *   GET /api/analytics/faculty               — faculty's own dashboard stats
 *   GET /api/analytics/programs/:id          — program-level aggregate stats
 *   GET /api/analytics/programs/:id/students — student metrics table
 */
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/analytics/faculty
   *
   * Returns aggregate metrics for the logged-in faculty's programs.
   * Faculty user ID is extracted from the JWT token automatically.
   *
   * Response: { success: true, data: FacultyAnalyticsResponseDto }
   */
  @Get('faculty')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getFacultyAnalytics(@Req() req): Promise<{ success: boolean; data: FacultyAnalyticsResponseDto }> {
    const data = await this.analyticsService.getFacultyAnalytics(req.user.id);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/programs/:id
   *
   * Returns aggregate metrics for a specific Program.
   *
   * Response: { success: true, data: ProgramAnalyticsResponseDto }
   */
  @Get('programs/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getProgramAnalytics(@Param('id') programId: string): Promise<{ success: boolean; data: ProgramAnalyticsResponseDto }> {
    const data = await this.analyticsService.getProgramAnalytics(programId);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/programs/:id/students
   *
   * Returns per-student metrics for all students enrolled in a Program.
   *
   * Response: { success: true, data: StudentMetricsResponseDto }
   */
  @Get('programs/:id/students')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getStudentMetrics(@Param('id') programId: string): Promise<{ success: boolean; data: StudentMetricsResponseDto }> {
    const data = await this.analyticsService.getStudentMetrics(programId);
    return { success: true, data };
  }
}
