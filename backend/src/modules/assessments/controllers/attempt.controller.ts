import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AttemptService } from "../services/attempt.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { StartAttemptDto, AutoSaveAnswersDto } from "../dto/attempt.dto";

@Controller("assessments/attempts")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post("start")
  async startAttempt(@Req() req, @Body() body: StartAttemptDto) {
    return this.attemptService.startAttempt(req.user.id, body.assessmentId);
  }

  @Get("history/:assessmentId")
  async getAttemptHistory(
    @Req() req,
    @Param("assessmentId") assessmentId: string
  ) {
    return this.attemptService.getAttemptHistory(req.user.id, assessmentId);
  }

  @Get(":id/resume")
  async resumeAttempt(@Req() req, @Param("id") id: string) {
    return this.attemptService.resumeAttempt(req.user.id, id);
  }

  @Post(":id/auto-save")
  async autoSaveAnswers(
    @Req() req,
    @Param("id") id: string,
    @Body() body: AutoSaveAnswersDto
  ) {
    return this.attemptService.autoSaveAnswers(
      req.user.id,
      id,
      body.answers
    );
  }

  @Post(":id/submit")
  async submitAttempt(@Req() req, @Param("id") id: string) {
    return this.attemptService.submitAttempt(req.user.id, id);
  }

  @Get(":id/result")
  async getAttemptResult(@Req() req, @Param("id") id: string) {
    return this.attemptService.getAttemptResult(req.user.id, id);
  }
}
