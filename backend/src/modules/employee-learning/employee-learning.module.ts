import { Module } from '@nestjs/common';
import { EmployeeLearningController } from './controllers/employee-learning.controller';
import { EmployeeDashboardService } from './services/employee-dashboard.service';
import { EmployeeProgressService } from './services/employee-progress.service';
import { EmployeeNotesService } from './services/employee-notes.service';
import { EmployeeBookmarksService } from './services/employee-bookmarks.service';
import { EmployeeTimelineService } from './services/employee-timeline.service';
import { EmployeeComplianceService } from './services/employee-compliance.service';
import { EmployeeLearningRepository } from './repositories/employee-learning.repository';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [DatabaseModule, AuditModule, NotificationsModule, AchievementsModule],
  controllers: [EmployeeLearningController],
  providers: [
    EmployeeLearningRepository,
    EmployeeDashboardService,
    EmployeeProgressService,
    EmployeeNotesService,
    EmployeeBookmarksService,
    EmployeeTimelineService,
    EmployeeComplianceService,
  ],
  exports: [
    EmployeeDashboardService,
    EmployeeProgressService,
    EmployeeComplianceService,
  ],
})
export class EmployeeLearningModule {}
