import { Module } from '@nestjs/common';
import { PlatformUserController } from './controllers/platform-user.controller';
import { PlatformInstitutionController } from './controllers/platform-institution.controller';
import { PlatformAnalyticsController } from './controllers/platform-analytics.controller';
import { PlatformAuditController } from './controllers/platform-audit.controller';
import { PlatformSettingsController } from './controllers/platform-settings.controller';

import { PlatformUserService } from './services/platform-user.service';
import { PlatformInstitutionService } from './services/platform-institution.service';
import { PlatformAnalyticsService } from './services/platform-analytics.service';
import { PlatformAuditService } from './services/platform-audit.service';
import { PlatformSettingsService } from './services/platform-settings.service';
import { SystemHealthService } from './services/system-health.service';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [
    PlatformUserController,
    PlatformInstitutionController,
    PlatformAnalyticsController,
    PlatformAuditController,
    PlatformSettingsController,
  ],
  providers: [
    PlatformUserService,
    PlatformInstitutionService,
    PlatformAnalyticsService,
    PlatformAuditService,
    PlatformSettingsService,
    SystemHealthService,
  ],
  exports: [
    PlatformUserService,
    PlatformInstitutionService,
    PlatformAnalyticsService,
    PlatformAuditService,
    PlatformSettingsService,
    SystemHealthService,
  ],
})
export class PlatformAdminModule {}
