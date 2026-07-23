import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UniversityDashboardService } from '../services/university-dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InstitutionScopeGuard } from '../../../common/guards/institution-scope.guard';

@Controller('university-admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionScopeGuard)
@Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
export class UniversityDashboardController {
  constructor(private readonly dashboardService: UniversityDashboardService) {}

  @Get()
  async getDashboardOverview(@Req() req) {
    return this.dashboardService.getDashboardOverview(req.institutionId);
  }
}
