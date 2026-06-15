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
} from '@nestjs/common';
import { LearningService } from '../services/learning.service';
import { ProgramsService } from '../../programs/services/programs.service';
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
    private readonly programsService: ProgramsService
  ) {}

  /**
   * GET /api/learning/lessons/:id
   * Get single lesson details.
   */
  @Get('lessons/:id')
  @UseGuards(JwtAuthGuard)
  async getLesson(@Param('id') id: string) {
    const lesson = await this.learningService.getLesson(id);
    return { success: true, lesson };
  }

  /**
   * POST /api/learning/modules/:moduleId/lessons
   * Create a new lesson. Restricted to owner Faculty/Admin.
   */
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

    // Lookup module track to enforce faculty ownership check
    const module = await this.programsService['prisma'].module.findUnique({
      where: { id: moduleId },
      include: { track: true },
    });

    if (!module) {
      throw new BadRequestException('Module not found');
    }

    await this.programsService.validateProgramOwnership(req.user.id, module.track.programId, req.user.role as UserRole);
    const lesson = await this.learningService.createLesson(moduleId, body);
    return { success: true, lesson };
  }

  /**
   * PUT /api/learning/lessons/:id
   * Update lesson content. Restricted to owner Faculty/Admin.
   */
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
    const updated = await this.learningService.updateLesson(id, body);
    return { success: true, lesson: updated };
  }

  /**
   * POST /api/learning/lessons/:id/progress
   * Mark a lesson as completed by the student.
   */
  @Post('lessons/:id/progress')
  @UseGuards(JwtAuthGuard)
  async completeLesson(@Param('id') id: string, @Req() req) {
    const result = await this.learningService.completeLesson(req.user.id, id);
    return result;
  }

  /**
   * DELETE /api/learning/lessons/:id/progress
   * Revert lesson completion status.
   */
  @Delete('lessons/:id/progress')
  @UseGuards(JwtAuthGuard)
  async uncompleteLesson(@Param('id') id: string, @Req() req) {
    const result = await this.learningService.uncompleteLesson(req.user.id, id);
    return result;
  }

  /**
   * POST /api/learning/lessons/:id/bookmark
   * Toggle bookmark status for a lesson.
   */
  @Post('lessons/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(@Param('id') id: string, @Req() req) {
    const result = await this.learningService.toggleBookmark(req.user.id, id);
    return result;
  }

  /**
   * PUT /api/learning/lessons/:id/notes
   * Upsert notes for a lesson.
   */
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

  /**
   * GET /api/learning/lessons/:id/notes
   * Get notes for a lesson.
   */
  @Get('lessons/:id/notes')
  @UseGuards(JwtAuthGuard)
  async getNote(@Param('id') id: string, @Req() req) {
    const note = await this.learningService.getNote(req.user.id, id);
    return { success: true, note };
  }
}
