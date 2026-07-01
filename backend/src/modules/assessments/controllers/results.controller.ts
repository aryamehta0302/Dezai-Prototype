import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AssessmentService } from '../services/assessment.service';
import { AttemptService } from '../services/attempt.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * Endpoints for assessment results, attempt status, history, and faculty analytics.
 *
 * All routes are under @Controller('assessments') and use multi-segment
 * paths (e.g. :assessmentId/attempt-status) to avoid collisions with
 * the existing single-segment :id routes in AssessmentController.
 */
@Controller('assessments')
export class ResultsController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly attemptService: AttemptService,
  ) {}

  // ─────────────────── TASK 2: ATTEMPT STATUS ───────────────────

  /**
   * GET /api/assessments/:assessmentId/attempt-status
   *
   * Returns remaining attempts, active attempt info, best score,
   * and whether the student can start a new attempt.
   */
  @Get(':assessmentId/attempt-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getAttemptStatus(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    return this.attemptService.getAttemptStatus(assessmentId, req.user.id);
  }

  // ─────────────────── TASK 1: ATTEMPT HISTORY (dual-role) ───────────────────

  /**
   * GET /api/assessments/:assessmentId/attempts/history
   *
   * Students see their own history; faculty see all students' history
   * for assessments they own (validated via ownership chain).
   */
  @Get(':assessmentId/attempts/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.FACULTY)
  async getAttemptHistory(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    if (req.user.role === UserRole.FACULTY) {
      await this.assessmentService.validateAssessmentFacultyOwnership(
        assessmentId,
        req.user.id,
      );
    }

    return this.attemptService.getAttemptHistory(
      assessmentId,
      req.user.id,
      req.user.role as UserRole,
    );
  }

  // ─────────────────── TASK 4: RESULT ANALYTICS ───────────────────

  /**
   * GET /api/assessments/:assessmentId/result-analytics
   *
   * Faculty-only. Returns pass rate, average score, score distribution,
   * and attempt counts for the given assessment.
   */
  @Get(':assessmentId/result-analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getResultAnalytics(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    await this.assessmentService.validateAssessmentFacultyOwnership(
      assessmentId,
      req.user.id,
    );

    return this.assessmentService.getResultAnalytics(assessmentId);
  }

  // ─────────────────── TASK 4: MISSED QUESTIONS ANALYTICS ───────────────────

  /**
   * GET /api/assessments/:assessmentId/missed-questions-analytics
   *
   * Faculty-only. Returns per-question wrong-answer rates sorted by
   * wrongRate DESC (hardest questions first).
   */
  @Get(':assessmentId/missed-questions-analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY)
  async getMissedQuestionsAnalytics(
    @Param('assessmentId') assessmentId: string,
    @Req() req,
  ) {
    await this.assessmentService.validateAssessmentFacultyOwnership(
      assessmentId,
      req.user.id,
    );

    return this.assessmentService.getMissedQuestionsAnalytics(assessmentId);
  }
}
