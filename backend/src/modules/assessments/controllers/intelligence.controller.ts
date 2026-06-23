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
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { WeakTopicDetectionService } from '../services/weak-topic-detection.service';
import { AssessmentAnalyticsService } from '../services/assessment-analytics.service';
import { AssessmentService } from '../services/assessment.service';

/**
 * IntelligenceController — Sprint 6 Task A endpoints
 *
 * Assessment Intelligence: weak topics, topic accuracy, difficulty analytics,
 * performance reports, and faculty/institution insight summaries.
 *
 * All routes are under @Controller('assessments') and use multi-segment
 * paths to avoid collisions with existing single-segment routes.
 */
@Controller('assessments')
export class IntelligenceController {
  constructor(
    private readonly weakTopicDetectionService: WeakTopicDetectionService,
    private readonly assessmentAnalyticsService: AssessmentAnalyticsService,
    private readonly assessmentService: AssessmentService,
  ) {}

  // ─────────────────── TASK A1: WEAK TOPICS (STUDENT) ───────────────────

  /**
   * GET /api/assessments/intelligence/my-weak-topics?assessmentId=:id
   *
   * Per-student weak topics for a specific assessment.
   */
  @Get('intelligence/my-weak-topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getStudentWeakTopics(
    @Req() req,
    @Query('assessmentId') assessmentId: string,
  ) {
    const result = await this.weakTopicDetectionService.getStudentWeakTopics(
      req.user.id,
      assessmentId,
    );
    return { success: true, weakTopics: result };
  }

  /**
   * GET /api/assessments/intelligence/my-weak-topics/global
   *
   * Per-student weak topics across ALL assessments.
   */
  @Get('intelligence/my-weak-topics/global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getStudentGlobalWeakTopics(@Req() req) {
    const result =
      await this.weakTopicDetectionService.getStudentGlobalWeakTopics(
        req.user.id,
      );
    return { success: true, weakTopics: result };
  }

  // ─────────────────── TASK A1: WEAK TOPICS (FACULTY) ───────────────────

  /**
   * GET /api/assessments/:assessmentId/intelligence/weak-topics
   *
   * Faculty view: aggregated weak topics across all students.
   */
  @Get(':assessmentId/intelligence/weak-topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getAssessmentWeakTopics(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    await this.assessmentService.validateAssessmentFacultyOwnership(
      assessmentId,
      req.user.id,
    );

    const result =
      await this.weakTopicDetectionService.getAssessmentWeakTopics(
        assessmentId,
      );
    return { success: true, weakTopics: result };
  }

  // ─────────────────── TASK A1: INCORRECT ANALYSIS (STUDENT) ───────────────────

  /**
   * GET /api/assessments/intelligence/my-incorrect-analysis?assessmentId=:id
   *
   * Which specific questions the student gets wrong most.
   */
  @Get('intelligence/my-incorrect-analysis')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getIncorrectQuestionAnalysis(
    @Req() req,
    @Query('assessmentId') assessmentId: string,
  ) {
    const result =
      await this.weakTopicDetectionService.getIncorrectQuestionAnalysis(
        req.user.id,
        assessmentId,
      );
    return { success: true, analysis: result };
  }

  // ─────────────────── TASK A2: ACCURACY TIMELINE (STUDENT) ───────────────────

  /**
   * GET /api/assessments/intelligence/my-topic-accuracy-timeline?assessmentId=:id
   *
   * Per-category accuracy over time for trend charts.
   */
  @Get('intelligence/my-topic-accuracy-timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getStudentTopicAccuracyTimeline(
    @Req() req,
    @Query('assessmentId') assessmentId: string,
  ) {
    const result =
      await this.weakTopicDetectionService.getStudentTopicAccuracyTimeline(
        req.user.id,
        assessmentId,
      );
    return { success: true, timeline: result };
  }

  // ─────────────────── TASK A2: TOPIC IMPROVEMENT (STUDENT) ───────────────────

  /**
   * GET /api/assessments/intelligence/my-topic-improvement?assessmentId=:id
   *
   * First attempt vs latest attempt accuracy delta per category.
   */
  @Get('intelligence/my-topic-improvement')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getStudentTopicImprovement(
    @Req() req,
    @Query('assessmentId') assessmentId: string,
  ) {
    const result =
      await this.weakTopicDetectionService.getStudentTopicImprovement(
        req.user.id,
        assessmentId,
      );
    return { success: true, improvement: result };
  }

  // ─────────────────── TASK A3: DIFFICULTY BREAKDOWN (FACULTY) ───────────────────

  /**
   * GET /api/assessments/:assessmentId/analytics/difficulty-breakdown
   *
   * EASY/MEDIUM/HARD accuracy breakdown for an assessment.
   */
  @Get(':assessmentId/analytics/difficulty-breakdown')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getDifficultyBreakdown(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    await this.assessmentService.validateAssessmentFacultyOwnership(
      assessmentId,
      req.user.id,
    );

    const result =
      await this.assessmentAnalyticsService.getDifficultyBreakdown(
        assessmentId,
      );
    return { success: true, difficultyBreakdown: result };
  }

  // ─────────────────── TASK A3: TREND (FACULTY) ───────────────────

  /**
   * GET /api/assessments/:assessmentId/analytics/trend
   *
   * Daily trend: attempts, avg score, pass rate.
   */
  @Get(':assessmentId/analytics/trend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getAssessmentTrend(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    await this.assessmentService.validateAssessmentFacultyOwnership(
      assessmentId,
      req.user.id,
    );

    const result =
      await this.assessmentAnalyticsService.getAssessmentTrend(assessmentId);
    return { success: true, trend: result };
  }

  // ─────────────────── TASK A3: PERFORMANCE REPORT (FACULTY) ───────────────────

  /**
   * GET /api/assessments/:assessmentId/analytics/performance-report
   *
   * Full performance report with all analytics combined.
   */
  @Get(':assessmentId/analytics/performance-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getAssessmentPerformanceReport(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    await this.assessmentService.validateAssessmentFacultyOwnership(
      assessmentId,
      req.user.id,
    );

    const result =
      await this.assessmentAnalyticsService.getAssessmentPerformanceReport(
        assessmentId,
      );
    return { success: true, report: result };
  }

  // ─────────────────── TASK A4: FACULTY INSIGHT SUMMARY ───────────────────

  /**
   * GET /api/assessments/analytics/faculty-insight-summary
   *
   * Summary of all assessments owned by the faculty member.
   */
  @Get('analytics/faculty-insight-summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getFacultyAssessmentInsightSummary(@Req() req) {
    const result =
      await this.assessmentAnalyticsService.getFacultyAssessmentInsightSummary(
        req.user.id,
      );
    return { success: true, summary: result };
  }

  // ─────────────────── TASK A4: INSTITUTION SUMMARY ───────────────────

  /**
   * GET /api/assessments/analytics/institution-summary?institutionId=:id
   *
   * Institution-level aggregation (UNIVERSITY_ADMIN / DEZAI_ADMIN only).
   */
  @Get('analytics/institution-summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getInstitutionAssessmentSummary(
    @Req() req,
    @Query('institutionId') institutionId: string,
  ) {
    const result =
      await this.assessmentAnalyticsService.getInstitutionAssessmentSummary(
        institutionId,
        req.user.id,
      );
    return { success: true, summary: result };
  }
}
