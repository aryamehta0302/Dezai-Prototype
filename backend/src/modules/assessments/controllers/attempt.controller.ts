import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttemptService } from '../services/attempt.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { StartAttemptDto, AutoSaveAnswersDto, SubmitAttemptDto } from '../dto/attempt.dto';

@Controller('assessments/attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  // ─────────────────── STATIC ROUTES (must be registered before :id) ───────────────────

  @Post('start')
  @Roles(UserRole.STUDENT)
  async startAttempt(@Req() req, @Body() body: StartAttemptDto) {
    return this.attemptService.startAttempt(req.user.id, body.assessmentId);
  }

  /**
   * GET /api/assessments/attempts/my-history
   * Sprint 5 Task 1: Cross-assessment history for the current student.
   * Registered before :id routes to prevent 'my-history' being captured as a param.
   */
  @Get('my-history')
  @Roles(UserRole.STUDENT)
  async getMyHistory(@Req() req) {
    return this.attemptService.getMyHistory(req.user.id);
  }

  @Get('history/:assessmentId')
  @Roles(UserRole.STUDENT)
  async getAttemptHistory(
    @Req() req,
    @Param('assessmentId') assessmentId: string,
  ) {
    return this.attemptService.getAttemptHistory(
      assessmentId,
      req.user.id,
      req.user.role as UserRole,
    );
  }

  // ─────────────────── PARAMETERISED ROUTES ───────────────────

  @Get(':id/resume')
  @Roles(UserRole.STUDENT)
  async resumeAttempt(@Req() req, @Param('id') id: string) {
    return this.attemptService.resumeAttempt(req.user.id, id);
  }

  @Post(':id/auto-save')
  @Roles(UserRole.STUDENT)
  async autoSaveAnswers(
    @Req() req,
    @Param('id') id: string,
    @Body() body: AutoSaveAnswersDto,
  ) {
    return this.attemptService.autoSaveAnswers(req.user.id, id, body.answers);
  }

  @Post(':id/submit')
  @Roles(UserRole.STUDENT)
  async submitAttempt(
    @Req() req,
    @Param('id') id: string,
    @Body() body: SubmitAttemptDto,
  ) {
    return this.attemptService.submitAttempt(req.user.id, id);
  }

  /**
   * GET /api/assessments/attempts/:id/result
   * Sprint 5: Enhanced to support faculty access via role parameter.
   */
  @Get(':id/result')
  @Roles(UserRole.STUDENT, UserRole.FACULTY)
  async getAttemptResult(@Req() req, @Param('id') id: string) {
    return this.attemptService.getAttemptResult(
      req.user.id,
      id,
      req.user.role as UserRole,
    );
  }
}

