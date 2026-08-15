import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PlatformAnalyticsService } from '../services/platform-analytics.service';
import { SystemHealthService } from '../services/system-health.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';

@Controller('platform-admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PlatformAnalyticsController {
  constructor(
    private readonly analyticsService: PlatformAnalyticsService,
    private readonly systemHealthService: SystemHealthService,
  ) {}

  @Get('analytics/overview')
  async getOverview() {
    return this.analyticsService.getPlatformOverview();
  }

  @Get('analytics/growth')
  async getGrowth(@Query('period') period?: string) {
    return this.analyticsService.getGrowthTrends(period);
  }

  @Get('search')
  async globalSearch(@Query('query') query: string) {
    return this.analyticsService.globalSearch(query);
  }

  @Get('system-health')
  async getSystemHealth() {
    return this.systemHealthService.getSystemHealth();
  }
}
