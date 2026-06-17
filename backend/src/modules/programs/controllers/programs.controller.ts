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
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { ProgramsService } from "../services/programs.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import {
  CreateProgramDto,
  UpdateProgramDto,
  CreateTrackDto,
  UpdateTrackDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
  ReorderModulesDto,
} from "../dto/programs.dto";

@Controller("programs")
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // ─────────────────── PROGRAMS ───────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPrograms(@Query("institutionId") institutionId?: string) {
    const programs = await this.programsService.getPrograms(institutionId);
    return { success: true, programs };
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getProgramById(@Param("id") id: string) {
    const program = await this.programsService.getProgramById(id);
    return { success: true, program };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createProgram(@Req() req, @Body() body: CreateProgramDto) {
    const program = await this.programsService.createProgram(
      req.user.id,
      req.user.role as UserRole,
      body
    );
    return { success: true, program };
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateProgram(
    @Param("id") id: string,
    @Req() req,
    @Body() body: UpdateProgramDto
  ) {
    await this.programsService.validateProgramOwnership(
      req.user.id,
      id,
      req.user.role as UserRole
    );
    const program = await this.programsService.updateProgram(
      id,
      body,
      req.user.id
    );
    return { success: true, program };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async deleteProgram(@Param("id") id: string, @Req() req) {
    await this.programsService.validateProgramOwnership(
      req.user.id,
      id,
      req.user.role as UserRole
    );
    await this.programsService.deleteProgram(id, req.user.id);
    return { success: true, message: "Program deleted" };
  }

  // ─────────────────── TRACKS ───────────────────

  @Get(":id/tracks")
  @UseGuards(JwtAuthGuard)
  async getProgramTracks(@Param("id") id: string) {
    const tracks = await this.programsService.getProgramTracks(id);
    return { success: true, tracks };
  }

  @Post(":id/tracks")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createTrack(
    @Param("id") programId: string,
    @Req() req,
    @Body() body: CreateTrackDto
  ) {
    await this.programsService.validateProgramOwnership(
      req.user.id,
      programId,
      req.user.role as UserRole
    );
    const track = await this.programsService.createTrack(programId, body);
    return { success: true, track };
  }

  @Put("tracks/:trackId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateTrack(
    @Param("trackId") trackId: string,
    @Req() req,
    @Body() body: UpdateTrackDto
  ) {
    const track = await this.programsService.getTrackById(trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    const updated = await this.programsService.updateTrack(trackId, body);
    return { success: true, track: updated };
  }

  // ─────────────────── MODULES ───────────────────

  @Post("tracks/:trackId/modules")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createModule(
    @Param("trackId") trackId: string,
    @Req() req,
    @Body() body: CreateModuleDto
  ) {
    const track = await this.programsService.getTrackById(trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    const module = await this.programsService.addModule(trackId, body);
    return { success: true, module };
  }

  @Put("modules/:moduleId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateModule(
    @Param("moduleId") moduleId: string,
    @Req() req,
    @Body() body: UpdateModuleDto
  ) {
    const mod = await this.programsService.getModuleById(moduleId);
    const track = await this.programsService.getTrackById(mod.trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    const updated = await this.programsService.updateModule(moduleId, body);
    return { success: true, module: updated };
  }

  @Delete("modules/:moduleId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async deleteModule(@Param("moduleId") moduleId: string, @Req() req) {
    const mod = await this.programsService.getModuleById(moduleId);
    const track = await this.programsService.getTrackById(mod.trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    await this.programsService.deleteModule(moduleId);
    return { success: true, message: "Module deleted" };
  }

  @Put("modules/:moduleId/reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async reorderModules(
    @Param("moduleId") trackId: string,
    @Req() req,
    @Body() body: ReorderModulesDto
  ) {
    const track = await this.programsService.getTrackById(trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    await this.programsService.reorderModules(trackId, body.orderedIds);
    return { success: true, message: "Modules reordered" };
  }

  // ─────────────────── LESSONS ───────────────────

  @Post("modules/:moduleId/lessons")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async createLesson(
    @Param("moduleId") moduleId: string,
    @Req() req,
    @Body() body: CreateLessonDto
  ) {
    const mod = await this.programsService.getModuleById(moduleId);
    const track = await this.programsService.getTrackById(mod.trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    const lesson = await this.programsService.addLesson(moduleId, body);
    return { success: true, lesson };
  }

  @Put("lessons/:lessonId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateLesson(
    @Param("lessonId") lessonId: string,
    @Req() req,
    @Body() body: UpdateLessonDto
  ) {
    const lesson = await this.programsService.getLessonById(lessonId);
    const mod = await this.programsService.getModuleById(lesson.moduleId);
    const track = await this.programsService.getTrackById(mod.trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    const updated = await this.programsService.updateLesson(lessonId, body);
    return { success: true, lesson: updated };
  }

  @Delete("lessons/:lessonId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACULTY, UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async deleteLesson(@Param("lessonId") lessonId: string, @Req() req) {
    const lesson = await this.programsService.getLessonById(lessonId);
    const mod = await this.programsService.getModuleById(lesson.moduleId);
    const track = await this.programsService.getTrackById(mod.trackId);
    await this.programsService.validateProgramOwnership(
      req.user.id,
      track.programId,
      req.user.role as UserRole
    );
    await this.programsService.deleteLesson(lessonId);
    return { success: true, message: "Lesson deleted" };
  }
}
