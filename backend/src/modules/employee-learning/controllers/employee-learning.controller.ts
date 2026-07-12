import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole, ComplianceTrack } from '@prisma/client';
import { EmployeeDashboardService } from '../services/employee-dashboard.service';
import { EmployeeProgressService } from '../services/employee-progress.service';
import { EmployeeNotesService } from '../services/employee-notes.service';
import { EmployeeBookmarksService } from '../services/employee-bookmarks.service';
import { EmployeeTimelineService } from '../services/employee-timeline.service';
import { EmployeeComplianceService } from '../services/employee-compliance.service';
import { EmployeeLearningRepository } from '../repositories/employee-learning.repository';
import { UpsertEmployeeNoteDto } from '../dto/upsert-employee-note.dto';
import { SubmitComplianceAttemptDto } from '../dto/submit-compliance-attempt.dto';

@Controller('employee-learning')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE)
export class EmployeeLearningController {
  constructor(
    private readonly dashboardService: EmployeeDashboardService,
    private readonly progressService: EmployeeProgressService,
    private readonly notesService: EmployeeNotesService,
    private readonly bookmarksService: EmployeeBookmarksService,
    private readonly timelineService: EmployeeTimelineService,
    private readonly complianceService: EmployeeComplianceService,
    private readonly repo: EmployeeLearningRepository,
  ) {}

  @Get('dashboard')
  async getDashboard(@Req() req) {
    const dashboard = await this.dashboardService.getDashboard(req.user.id);
    return { success: true, ...dashboard };
  }

  @Get('progress')
  async getProgress(@Req() req) {
    const progress = await this.progressService.getTrackProgressList(req.user.id);
    return { success: true, tracks: progress };
  }

  @Get('progress/:track')
  async getTrackProgress(@Req() req, @Param('track') track: ComplianceTrack) {
    const detail = await this.progressService.getTrackProgressDetail(req.user.id, track);
    return { success: true, ...detail };
  }

  @Get('assessments')
  async listAssessments(@Req() req) {
    const assessments = await this.complianceService.listAssessments(req.user.id);
    return { success: true, assessments };
  }

  @Get('assessments/:id')
  async getAssessmentDetail(@Req() req, @Param('id') id: string) {
    const detail = await this.complianceService.getAssessmentDetail(req.user.id, id);
    return { success: true, assessment: detail };
  }

  @Post('assessments/:id/start')
  @HttpCode(HttpStatus.CREATED)
  async startAttempt(@Req() req, @Param('id') id: string) {
    const result = await this.complianceService.startAttempt(req.user.id, id);
    return { success: true, ...result };
  }

  @Post('assessments/:id/submit')
  async submitAttempt(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: SubmitComplianceAttemptDto,
  ) {
    const result = await this.complianceService.submitAttempt(req.user.id, id, dto);
    return { success: true, ...result };
  }

  @Get('assessments/:id/history')
  async getAssessmentHistory(@Req() req, @Param('id') id: string) {
    const history = await this.complianceService.getAttemptHistory(req.user.id, id);
    return { success: true, attempts: history };
  }

  @Get('assessments/:id/notes')
  async getAssessmentNote(@Req() req, @Param('id') id: string) {
    const note = await this.notesService.getNote(req.user.id, id);
    return { success: true, note };
  }

  @Put('assessments/:id/notes')
  async upsertNote(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpsertEmployeeNoteDto,
  ) {
    const note = await this.notesService.upsertNote(req.user.id, id, dto.content);
    return { success: true, note };
  }

  @Post('assessments/:id/bookmark')
  async toggleBookmark(@Req() req, @Param('id') id: string) {
    const result = await this.bookmarksService.toggleBookmark(req.user.id, id);
    return { success: true, ...result };
  }

  @Get('bookmarks')
  async getBookmarks(@Req() req) {
    const bookmarks = await this.bookmarksService.getBookmarks(req.user.id);
    return { success: true, bookmarks };
  }

  @Get('notes')
  async getAllNotes(@Req() req) {
    const notes = await this.notesService.getAllNotes(req.user.id);
    return { success: true, notes };
  }

  @Get('history')
  async getHistory(@Req() req) {
    const history = await this.timelineService.getHistory(req.user.id);
    return { success: true, ...history };
  }

  @Get('timeline')
  async getTimeline(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.timelineService.getTimeline(req.user.id, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    return { success: true, ...result };
  }

  @Get('daily-activity')
  async getDailyActivity(@Req() req, @Query('year') year?: string) {
    const activity = await this.timelineService.getDailyActivity(
      req.user.id,
      year ? parseInt(year) : undefined,
    );
    return { success: true, activity };
  }

  @Get('stats')
  async getStats(@Req() req) {
    const dashboard = await this.dashboardService.getDashboard(req.user.id);
    return {
      success: true,
      xp: dashboard.totalXpEarned,
      currentStreak: dashboard.currentStreak,
      assessmentsPassed: dashboard.assessmentsPassed,
      credentialsEarned: dashboard.credentialsEarned,
      orgRank: dashboard.orgRank,
    };
  }

  @Get('achievements')
  async getAchievements(@Req() req) {
    const credentials = await this.repo.findCredentialsByUser(req.user.id);
    return { success: true, credentials };
  }

  @Get('leaderboard')
  async getLeaderboard(@Req() req, @Query('limit') limit?: string) {
    const employee = await this.repo.findEmployeeByUserId(req.user.id);
    if (!employee) {
      return { success: true, entries: [], currentUser: null };
    }

    const [entries, position] = await Promise.all([
      this.repo.getOrgLeaderboard(employee.organizationId, limit ? parseInt(limit) : 50),
      this.repo.getLeaderboardUserPosition(employee.organizationId, req.user.id),
    ]);

    const leaderboard = entries.map((e) => ({
      ...e,
      isCurrentUser: e.userId === req.user.id,
    }));

    return {
      success: true,
      entries: leaderboard,
      currentUser: position,
      organization: employee.organization.name,
    };
  }

  @Get('profile')
  async getProfile(@Req() req) {
    const employee = await this.repo.findEmployeeByUserId(req.user.id);
    if (!employee) {
      return { success: false, message: 'Employee profile not found' };
    }

    const userData = await this.repo.getUserXp(req.user.id);
    const credentials = await this.repo.findCredentialsByUser(req.user.id);
    const attempts = await this.repo.findAttemptsByUser(req.user.id);
    const passedAttempts = attempts.filter((a) => a.passed);

    const level = userData ? Math.floor(userData.xp / 1000) + 1 : 1;

    return {
      success: true,
      profile: {
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        employeeId: employee.id,
        title: employee.title,
        department: employee.department?.name || null,
        organization: employee.organization.name,
        organizationId: employee.organizationId,
        employmentStatus: employee.employmentStatus,
        joinedAt: employee.joinedAt,
        totalXp: userData?.xp || 0,
        level,
        assessmentsPassed: passedAttempts.length,
        credentialsEarned: credentials.length,
        currentStreak: userData?.streakCount || 0,
        lastActiveAt: userData?.lastActiveAt,
      },
    };
  }
}
