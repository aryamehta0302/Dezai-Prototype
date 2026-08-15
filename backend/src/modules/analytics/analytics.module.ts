import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
// Sprint 8: Enterprise Analytics (additive — does not modify existing registrations)
import { EnterpriseAnalyticsController } from './controllers/enterprise-analytics.controller';
import { EnterpriseAnalyticsService } from './services/enterprise-analytics.service';
import { ProgramsModule } from '../programs/programs.module';

/**
 * AnalyticsModule
 *
 * Registers the analytics controller and service.
 * Exported so other modules can use AnalyticsService if needed.
 * This module is already imported in AppModule (app.module.ts).
 *
 * Sprint 8: EnterpriseAnalyticsController + EnterpriseAnalyticsService added.
 * Separate controller avoids FacultyDataAccessInterceptor audit corruption.
 */
@Module({
  imports: [ProgramsModule],
  controllers: [AnalyticsController, EnterpriseAnalyticsController],
  providers: [AnalyticsService, EnterpriseAnalyticsService],
  exports: [AnalyticsService, EnterpriseAnalyticsService],
})
export class AnalyticsModule {}

