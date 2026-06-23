import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  AnalyticsService,
  FacultyAnalyticsResponseDto,
  ProgramAnalyticsResponseDto,
  StudentMetricsResponseDto,
  FacultyProgramDto,
  ModuleCompletionStatDto,
  StudentDetailedProgressResponseDto,
  ProgramInsightsResponseDto,
  InterventionDto,
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
   * GET /api/analytics/faculty/extended
   * Returns extended metrics: completion rate, top/weak students, and difficult modules.
   */
  @Get('faculty/extended')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getFacultyExtendedAnalytics(@Req() req) {
    const data = await this.analyticsService.getFacultyExtendedAnalytics(req.user.id);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/faculty/activity
   * Returns chronological activity feed.
   */
  @Get('faculty/activity')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getFacultyActivityFeed(@Req() req) {
    const data = await this.analyticsService.getFacultyActivityFeed(req.user.id);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/faculty/programs
   * Returns a list of all programs taught by the faculty.
   */
  @Get('faculty/programs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getFacultyPrograms(@Req() req): Promise<{ success: boolean; data: FacultyProgramDto[] }> {
    const data = await this.analyticsService.getFacultyPrograms(req.user.id);
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

  /**
   * GET /api/analytics/programs/:id/modules/stats
   * Returns module completion statistics for a program.
   */
  @Get('programs/:id/modules/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getModuleCompletionStats(@Param('id') programId: string): Promise<{ success: boolean; data: ModuleCompletionStatDto[] }> {
    const data = await this.analyticsService.getModuleCompletionStats(programId);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/programs/:programId/students/:userId
   * Returns detailed student progress and proctoring violation logs.
   */
  @Get('programs/:programId/students/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getStudentDetailedProgress(
    @Param('programId') programId: string,
    @Param('userId') userId: string,
  ): Promise<{ success: boolean; data: StudentDetailedProgressResponseDto }> {
    const data = await this.analyticsService.getStudentDetailedProgress(programId, userId);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/programs/:id/insights
   * Returns cohort insights, flagged at-risk students and academic health metrics.
   */
  @Get('programs/:id/insights')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getProgramInsights(@Param('id') programId: string): Promise<{ success: boolean; data: ProgramInsightsResponseDto }> {
    const data = await this.analyticsService.getProgramInsights(programId);
    return { success: true, data };
  }

  /**
   * POST /api/analytics/programs/:id/interventions
   * Logs a new outreach intervention to a student (creates student notification and logs audit).
   */
  @Post('programs/:id/interventions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createIntervention(
    @Param('id') programId: string,
    @Req() req,
    @Body() body: { userId: string; message: string },
  ): Promise<{ success: boolean; data: any }> {
    const data = await this.analyticsService.createIntervention(
      programId,
      req.user.id,
      body.userId,
      body.message,
    );
    return { success: true, data };
  }

  /**
   * GET /api/analytics/programs/:id/interventions
   * Returns history of sent outreach interventions for a program.
   */
  @Get('programs/:id/interventions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getInterventionsList(@Param('id') programId: string): Promise<{ success: boolean; data: InterventionDto[] }> {
    const data = await this.analyticsService.getInterventionsList(programId);
    return { success: true, data };
  }
}
