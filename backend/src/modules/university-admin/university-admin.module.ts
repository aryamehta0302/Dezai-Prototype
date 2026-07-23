import { Module } from '@nestjs/common';
import { FacultyManagementController } from './controllers/faculty-management.controller';
import { StudentOversightController } from './controllers/student-oversight.controller';
import { UniversityDashboardController } from './controllers/university-dashboard.controller';
import { UniversitySettingsController } from './controllers/university-settings.controller';

import { FacultyManagementService } from './services/faculty-management.service';
import { StudentOversightService } from './services/student-oversight.service';
import { UniversityDashboardService } from './services/university-dashboard.service';
import { UniversitySettingsService } from './services/university-settings.service';

import { AuditModule } from '../audit/audit.module';
import { RbacScopeModule } from '../../shared/rbac-scope.module';

@Module({
  imports: [AuditModule, RbacScopeModule],
  controllers: [
    FacultyManagementController,
    StudentOversightController,
    UniversityDashboardController,
    UniversitySettingsController,
  ],
  providers: [
    FacultyManagementService,
    StudentOversightService,
    UniversityDashboardService,
    UniversitySettingsService,
  ],
  exports: [
    FacultyManagementService,
    StudentOversightService,
    UniversityDashboardService,
    UniversitySettingsService,
  ],
})
export class UniversityAdminModule {}
