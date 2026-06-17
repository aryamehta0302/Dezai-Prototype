import { Controller, Post, Get, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AssessmentsService } from '../services/assessments.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ViolationType } from '@prisma/client';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('sessions/active')
  async getActiveSession(@Req() req, @Query('assessmentId') assessmentId?: string) {
    const session = await this.assessmentsService.getActiveSession(req.user.id, assessmentId);
    return { success: true, session };
  }

  @Post('sessions')
  async createSession(@Req() req, @Body() body: { assessmentId: string }) {
    const session = await this.assessmentsService.createSession(req.user.id, body.assessmentId);
    return { success: true, session };
  }

  @Get('sessions/:id')
  async getSession(@Req() req, @Param('id') id: string) {
    const session = await this.assessmentsService.getSession(req.user.id, id);
    return { success: true, session };
  }

  @Post('sessions/:id/violations')
  async logViolation(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { type: ViolationType }
  ) {
    const session = await this.assessmentsService.logViolation(req.user.id, id, body.type);
    return { success: true, session };
  }

  @Post('sessions/:id/submit')
  async submitSession(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { answers: Record<string, string> }
  ) {
    const result = await this.assessmentsService.submitSession(req.user.id, id, body.answers);
    return { success: true, ...result };
  }
}
