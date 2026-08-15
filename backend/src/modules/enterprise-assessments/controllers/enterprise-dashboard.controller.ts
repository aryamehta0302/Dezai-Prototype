import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { EnterpriseDashboardService } from '../services/enterprise-dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ComplianceTrack } from '@prisma/client';

@Controller('enterprise/assessments/dashboard')
@UseGuards(JwtAuthGuard)
export class EnterpriseDashboardController {
  constructor(
    private readonly dashboardService: EnterpriseDashboardService,
  ) {}

  @Get('organization/:orgId')
  async getOrganizationDashboard(@Param('orgId') orgId: string) {
    const dashboard = await this.dashboardService.getOrganizationDashboard(orgId);
    return { success: true, dashboard };
  }

  @Get('department/:deptId')
  async getDepartmentDashboard(@Param('deptId') deptId: string) {
    const dashboard = await this.dashboardService.getDepartmentDashboard(deptId);
    return { success: true, dashboard };
  }

  @Get('employee')
  async getEmployeeDashboard(@Req() req) {
    const dashboard = await this.dashboardService.getEmployeeDashboard(req.user.id);
    return { success: true, dashboard };
  }

  @Get('track/:orgId/:track')
  async getTrackSummary(
    @Param('orgId') orgId: string,
    @Param('track') track: ComplianceTrack,
  ) {
    const summary = await this.dashboardService.getComplianceTrackSummary(orgId, track);
    return { success: true, summary };
  }
}
