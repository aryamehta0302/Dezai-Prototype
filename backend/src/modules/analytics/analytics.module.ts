import { Module, Global } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { FacultyInsightsStreamController } from './controllers/faculty-insights-stream.controller';
import { AnalyticsService } from './services/analytics.service';
import { InsightsSseService } from './services/insights-sse.service';

/**
 * AnalyticsModule
 *
 * Registers the analytics controller and service.
 * Exported so other modules can use AnalyticsService if needed.
 * This module is already imported in AppModule (app.module.ts).
 */
@Global()
@Module({
  imports: [],
  controllers: [AnalyticsController, FacultyInsightsStreamController],
  providers: [AnalyticsService, InsightsSseService],
  exports: [AnalyticsService, InsightsSseService],
})
export class AnalyticsModule {}
