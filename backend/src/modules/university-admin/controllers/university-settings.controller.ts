import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UniversitySettingsService } from '../services/university-settings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InstitutionScopeGuard } from '../../../common/guards/institution-scope.guard';
import { UpdateUniversityProfileDto } from '../dto/university-settings.dto';

@Controller('university-admin')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionScopeGuard)
@Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
export class UniversitySettingsController {
  constructor(private readonly settingsService: UniversitySettingsService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return this.settingsService.getUniversityProfile(req.institutionId);
  }

  @Patch('profile')
  async updateProfile(@Req() req, @Body() body: UpdateUniversityProfileDto) {
    return this.settingsService.updateUniversityProfile(req.institutionId, body, req.user.id || req.user.userId);
  }

  @Get('statistics/faculty')
  async getFacultyStatistics(@Req() req) {
    return this.settingsService.getFacultyStatistics(req.institutionId);
  }

  @Get('statistics/students')
  async getStudentStatistics(@Req() req) {
    return this.settingsService.getStudentStatistics(req.institutionId);
  }

  @Get('programs/active')
  async getActivePrograms(@Req() req) {
    return this.settingsService.getActivePrograms(req.institutionId);
  }

  @Get('analytics')
  async getAnalytics(@Req() req) {
    return this.settingsService.getAnalyticsDashboard(req.institutionId);
  }
}
