import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MentorIntelligenceService } from '../services/mentor-intelligence.service';
import { GenerateStudyNotesDto } from '../dto/intelligence.dto';

@Controller('ai-mentor')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(
    private readonly mentorIntelligenceService: MentorIntelligenceService,
  ) {}

  @Get('recommendations')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(@Req() req) {
    const recommendations =
      await this.mentorIntelligenceService.getRecommendations(req.user.id);

    return { success: true, recommendations };
  }

  @Post('remediation/attempt/:attemptId')
  @HttpCode(HttpStatus.OK)
  async generateRemediationPlan(
    @Req() req,
    @Param('attemptId') attemptId: string,
  ) {
    const remediation =
      await this.mentorIntelligenceService.generateRemediationPlan(
        req.user.id,
        attemptId,
      );

    return { success: true, remediation };
  }

  @Post('lessons/:lessonId/summary')
  @HttpCode(HttpStatus.OK)
  async generateLessonSummary(@Param('lessonId') lessonId: string) {
    const summary =
      await this.mentorIntelligenceService.generateLessonSummary(lessonId);

    return { success: true, summary };
  }

  @Post('modules/:moduleId/summary')
  @HttpCode(HttpStatus.OK)
  async generateModuleSummary(@Param('moduleId') moduleId: string) {
    const summary =
      await this.mentorIntelligenceService.generateModuleSummary(moduleId);

    return { success: true, summary };
  }

  @Post('lessons/:lessonId/study-notes')
  @HttpCode(HttpStatus.OK)
  async generateStudyNotes(
    @Req() req,
    @Param('lessonId') lessonId: string,
    @Body() dto: GenerateStudyNotesDto,
  ) {
    const notes = await this.mentorIntelligenceService.generateStudyNotes(
      req.user.id,
      lessonId,
      dto.saveToNotes === true,
    );

    return { success: true, notes };
  }
}
