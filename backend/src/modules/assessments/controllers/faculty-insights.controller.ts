import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { InstitutionActiveGuard } from '../../../common/guards/institution-active.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FacultyInsightService } from '../services/faculty-insight.service';
import { AssessmentService } from '../services/assessment.service';

/**
 * Faculty Insights & Intervention: at-risk detection, low-progress alerts,
 * inactive student monitoring, academic health scoring, repeated failure
 * analysis, and detailed student insight views.
 *
 * All routes are under @Controller('assessments') and use the
 * 'faculty-insights/' prefix to namespace Task B endpoints.
 */
@Controller('assessments')
@UseGuards(InstitutionActiveGuard)
export class FacultyInsightsController {
  constructor(
    private readonly facultyInsightService: FacultyInsightService,
    private readonly assessmentService: AssessmentService,
  ) {}

  // ─────────────────── TASK B1: AT-RISK STUDENTS ───────────────────

  /**
   * GET /api/assessments/faculty-insights/at-risk
   *
   * Students who have failed the same assessment >= 2 times.
   */
  @Get('faculty-insights/at-risk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getAtRiskStudents(@Req() req) {
    const result = await this.facultyInsightService.getAtRiskStudents(
      req.user.id,
    );
    return { success: true, atRiskStudents: result };
  }

  // ─────────────────── TASK B1: LOW PROGRESS STUDENTS ───────────────────

  /**
   * GET /api/assessments/faculty-insights/low-progress
   *
   * Students with enrollment progress <= 30%.
   */
  @Get('faculty-insights/low-progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getLowProgressStudents(@Req() req) {
    const result = await this.facultyInsightService.getLowProgressStudents(
      req.user.id,
    );
    return { success: true, lowProgressStudents: result };
  }

  // ─────────────────── TASK B1: INACTIVE STUDENTS ───────────────────

  /**
   * GET /api/assessments/faculty-insights/inactive
   *
   * Students inactive for 7+ days who are enrolled in faculty's programs.
   */
  @Get('faculty-insights/inactive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getInactiveStudents(@Req() req) {
    const result = await this.facultyInsightService.getInactiveStudents(
      req.user.id,
    );
    return { success: true, inactiveStudents: result };
  }

  // ─────────────────── TASK B1: FACULTY INSIGHT DASHBOARD ───────────────────

  /**
   * GET /api/assessments/faculty-insights/dashboard
   *
   * Combined view: at-risk + low-progress + inactive with summary counts.
   */
  @Get('faculty-insights/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getFacultyInsightDashboard(@Req() req) {
    const result = await this.facultyInsightService.getFacultyInsightDashboard(
      req.user.id,
    );
    return { success: true, dashboard: result };
  }

  // ─────────────────── TASK B1: STUDENT ACADEMIC HEALTH ───────────────────

  /**
   * GET /api/assessments/faculty-insights/student/:userId/academic-health
   *
   * Composite academic health score (0–100) with risk level for a student.
   */
  @Get('faculty-insights/student/:userId/academic-health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getStudentAcademicHealth(
    @Param('userId') userId: string,
    @Req() req,
  ) {
    const result = await this.facultyInsightService.getStudentAcademicHealth(
      userId,
      req.user.id,
    );
    return { success: true, academicHealth: result };
  }

  // ─────────────────── TASK B2: REPEATED FAILURES ───────────────────

  /**
   * GET /api/assessments/faculty-insights/repeated-failures?assessmentId=:id
   *
   * Students with repeated failures, optionally scoped to one assessment.
   */
  @Get('faculty-insights/repeated-failures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getRepeatedFailureStudents(
    @Req() req,
    @Query('assessmentId') assessmentId?: string,
  ) {
    const result =
      await this.facultyInsightService.getRepeatedFailureStudents(
        req.user.id,
        assessmentId,
      );
    return { success: true, repeatedFailures: result };
  }

  // ─────────────────── TASK B2: FAILURE PATTERN ───────────────────

  /**
   * GET /api/assessments/:assessmentId/faculty-insights/failure-pattern
   *
   * Assessment-level failure analysis with difficulty concentration.
   */
  @Get(':assessmentId/faculty-insights/failure-pattern')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getFailurePatternByAssessment(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    await this.assessmentService.validateAssessmentFacultyOwnership(
      assessmentId,
      req.user.id,
    );

    const result =
      await this.facultyInsightService.getFailurePatternByAssessment(
        assessmentId,
        req.user.id,
      );
    return { success: true, failurePattern: result };
  }

  // ─────────────────── TASK B3: STUDENT DETAIL INSIGHT ───────────────────

  /**
   * GET /api/assessments/faculty-insights/student/:userId/detail
   *
   * Full per-student profile for faculty review.
   */
  @Get('faculty-insights/student/:userId/detail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getStudentDetailInsight(
    @Param('userId') userId: string,
    @Req() req,
  ) {
    const result = await this.facultyInsightService.getStudentDetailInsight(
      userId,
      req.user.id,
    );
    return { success: true, studentInsight: result };
  }
}
