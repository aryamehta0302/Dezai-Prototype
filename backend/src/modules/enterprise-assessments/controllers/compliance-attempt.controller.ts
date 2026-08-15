import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ComplianceAttemptService } from '../services/compliance-attempt.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  StartComplianceAttemptDto,
  SubmitComplianceAttemptDto,
} from '../dto/enterprise-assessment.dto';

@Controller('enterprise/assessments/attempts')
@UseGuards(JwtAuthGuard)
export class ComplianceAttemptController {
  constructor(
    private readonly attemptService: ComplianceAttemptService,
  ) {}

  @Post('start')
  async startAttempt(@Req() req, @Body() body: StartComplianceAttemptDto) {
    const result = await this.attemptService.startAttempt(
      req.user.id,
      body.assessmentId,
    );
    return { success: true, ...result };
  }

  @Post(':attemptId/submit')
  async submitAttempt(
    @Req() req,
    @Param('attemptId') attemptId: string,
    @Body() body: SubmitComplianceAttemptDto,
  ) {
    const result = await this.attemptService.submitAttempt(
      req.user.id,
      attemptId,
      body.answers,
    );
    return { success: true, ...result };
  }

  @Get(':attemptId/result')
  async getAttemptResult(@Req() req, @Param('attemptId') attemptId: string) {
    const result = await this.attemptService.getAttemptResult(
      req.user.id,
      attemptId,
    );
    return { success: true, result };
  }

  @Get('history/:assessmentId')
  async getAttemptHistory(
    @Req() req,
    @Param('assessmentId') assessmentId: string,
  ) {
    const history = await this.attemptService.getAttemptHistory(
      assessmentId,
      req.user.id,
    );
    return { success: true, history };
  }

  @Get('my-history')
  async getMyComplianceHistory(@Req() req) {
    const history = await this.attemptService.getMyComplianceHistory(req.user.id);
    return { success: true, history };
  }
}
