import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { LearningService } from '../services/learning.service';
import { LearningActivityService } from '../services/learning-activity.service';
import { LearningMilestoneService } from '../services/learning-milestone.service';
import { LearningPatternService } from '../services/learning-pattern.service';
import { LearningInsightService } from '../services/learning-insight.service';
import { LearningRecommendationService } from '../services/learning-recommendation.service';
import { ProgramsService } from '../../programs/services/programs.service';
import { LearningCleanupService } from '../services/learning-cleanup.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

export class CreateLessonDto {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

export class UpdateLessonDto {
  title?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}

export class UpsertNoteDto {
  content: string;
}

@Controller('learning')
export class LearningController {
  constructor(
    private readonly learningService: LearningService,
    private readonly programsService: ProgramsService,
    private readonly activityService: LearningActivityService,
    private readonly milestoneService: LearningMilestoneService,
    private readonly patternService: LearningPatternService,
    private readonly insightService: LearningInsightService,
    private readonly recommendationService: LearningRecommendationService,
    private readonly cleanupService: LearningCleanupService,
  ) { }

  // ─── LESSONS ────────────────────────────────────────────────

  @Get('lessons/:id')
  @UseGuards(JwtAuthGuard)
  async getLesson(@Param('id') id: string) {
    const lesson = await this.learningService.getLesson(id);
    return { success: true, lesson };
  }

  @Get('lessons/:id/resources')
  @UseGuards(JwtAuthGuard)
  async getLessonResources(@Param('id') id: string) {
    const resources = await this.learningService.getLessonResources(id);
    return { success: true, resources };
  }

  @Post('modules/:moduleId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Req() req,
    @Body() body: CreateLessonDto
  ) {
    if (!body.title || !body.content || body.order === undefined) {
      throw new BadRequestException('Title, content, and order are required');
    }

    const module = await this.programsService['prisma'].module.findUnique({
      where: { id: moduleId },
      include: { track: true },
    });

    if (!module) {
      throw new BadRequestException('Module not found');
    }

    await this.programsService.validateProgramOwnership(req.user.id, module.track.programId, req.user.role as UserRole);
    const lesson = await this.learningService.createLesson(req.user.id, moduleId, body);
    return { success: true, lesson };
  }

  @Put('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateLesson(
    @Param('id') id: string,
    @Req() req,
    @Body() body: UpdateLessonDto
  ) {
    const lesson = await this.learningService.getLesson(id);
    const module = await this.programsService['prisma'].module.findUnique({
      where: { id: lesson.moduleId },
      include: { track: true },
    });

    await this.programsService.validateProgramOwnership(req.user.id, module.track.programId, req.user.role as UserRole);
    const updated = await this.learningService.updateLesson(req.user.id, id, body);
    return { success: true, lesson: updated };
  }

  @Post('lessons/:id/progress')
  @UseGuards(JwtAuthGuard)
  async completeLesson(@Param('id') id: string, @Req() req) {
    const result = await this.learningService.completeLesson(req.user.id, id);
    return result;
  }

  @Delete('lessons/:id/progress')
  @UseGuards(JwtAuthGuard)
  async uncompleteLesson(@Param('id') id: string, @Req() req) {
    const result = await this.learningService.uncompleteLesson(req.user.id, id);
    return result;
  }

  @Post('lessons/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(@Param('id') id: string, @Req() req) {
    const result = await this.learningService.toggleBookmark(req.user.id, id);
    return result;
  }

  @Put('lessons/:id/notes')
  @UseGuards(JwtAuthGuard)
  async upsertNote(
    @Param('id') id: string,
    @Req() req,
    @Body() body: UpsertNoteDto
  ) {
    const note = await this.learningService.upsertNote(req.user.id, id, body.content || '');
    return { success: true, note };
  }

  @Get('lessons/:id/notes')
  @UseGuards(JwtAuthGuard)
  async getNote(@Param('id') id: string, @Req() req) {
    const note = await this.learningService.getNote(req.user.id, id);
    return { success: true, note };
  }

  // ─── STATS ──────────────────────────────────────────────────

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStudentStats(@Req() req) {
    const stats = await this.learningService.getStudentStats(req.user.id);
    return { success: true, ...stats };
  }

  // ─── DAILY ACTIVITY (heatmap) ───────────────────────────────

  @Get('daily-activity')
  @UseGuards(JwtAuthGuard)
  async getDailyActivity(
    @Req() req,
    @Query('year') year?: string,
  ) {
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const data = await this.activityService.getDailyActivity(req.user.id, targetYear);
    return { success: true, data };
  }

  // ─── ACTIVITY TIMELINE ──────────────────────────────────────

  @Get('activities')
  @UseGuards(JwtAuthGuard)
  async getActivityTimeline(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('types') types?: string,
    @Query('cursor') cursor?: string,
  ) {
    const { events, nextCursor } = await this.activityService.getActivityTimeline(req.user.id, {
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
      types: types ? (types.split(',') as any) : undefined,
      cursor: cursor,
    });
    return { success: true, data: events, nextCursor };
  }

  // ─── MILESTONES ─────────────────────────────────────────────

  @Get('milestones')
  @UseGuards(JwtAuthGuard)
  async getMilestones(@Req() req) {
    const data = await this.milestoneService.getMilestones(req.user.id);
    return { success: true, data };
  }

  // ─── LEARNING PATTERNS ──────────────────────────────────────

  @Get('patterns')
  @UseGuards(JwtAuthGuard)
  async getLearningPatterns(@Req() req) {
    const data = await this.patternService.getLearningPatterns(req.user.id);
    return { success: true, data };
  }

  @Get('streaks')
  @UseGuards(JwtAuthGuard)
  async getStreakInfo(@Req() req) {
    const data = await this.patternService.getStreakInfo(req.user.id);
    return { success: true, data };
  }

  // ─── INSIGHTS ───────────────────────────────────────────────

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  async getInsights(@Req() req) {
    const data = await this.insightService.getInsights(req.user.id);
    return { success: true, data };
  }

  // ─── RECOMMENDATIONS ────────────────────────────────────────

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendations(@Req() req) {
    const data = await this.recommendationService.getRecommendations(req.user.id);
    return { success: true, data };
  }

  @Get('weak-topics')
  @UseGuards(JwtAuthGuard)
  async getWeakTopics(@Req() req) {
    const data = await this.recommendationService.getWeakTopics(req.user.id);
    return { success: true, data };
  }

  @Get('difficulty-analysis')
  @UseGuards(JwtAuthGuard)
  async getDifficultyAnalysis(@Req() req) {
    const data = await this.recommendationService.getDifficultyAnalysis(req.user.id);
    return { success: true, data };
  }

  @Get('prediction-rules')
  @UseGuards(JwtAuthGuard)
  async getPredictionRules(@Req() req) {
    const data = await this.recommendationService.getPredictionRules(req.user.id);
    return { success: true, data };
  }

  // ─── CLEANUP (Admin only) ─────────────────────────────────────

  @Post('cleanup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async runCleanup() {
    const result = await this.cleanupService.runFullCleanup();
    return { success: true, cleaned: result };
  }
}
