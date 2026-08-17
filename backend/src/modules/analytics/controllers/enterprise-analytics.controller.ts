/**
 * @module modules/analytics/controllers/enterprise-analytics.controller
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only. Separate controller to avoid FacultyDataAccessInterceptor.
 */

import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { EnterpriseAnalyticsService } from '../services/enterprise-analytics.service';

@Controller('analytics/enterprise')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MANAGER, UserRole.DEZAI_ADMIN)
export class EnterpriseAnalyticsController {
  constructor(private readonly service: EnterpriseAnalyticsService) {}

  @Get('overview')
  getOverview(@Request() req: any, @Query('organizationId') organizationId?: string) {
    return this.service.getOverview(req.user.sub, organizationId);
  }

  @Get('tracks')
  getTrackBreakdown(@Request() req: any, @Query('organizationId') organizationId?: string) {
    return this.service.getTrackBreakdown(req.user.sub, organizationId);
  }

  @Get('departments')
  getDepartmentBreakdown(@Request() req: any, @Query('organizationId') organizationId?: string) {
    return this.service.getDepartmentBreakdown(req.user.sub, organizationId);
  }

  @Get('employees')
  getEmployeeCompliance(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.service.getEmployeeCompliance(
      req.user.sub,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      organizationId,
    );
  }

  @Get('activity')
  getActivityFeed(@Request() req: any, @Query('organizationId') organizationId?: string) {
    return this.service.getActivityFeed(req.user.sub, organizationId);
  }
}
