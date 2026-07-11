import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { ProgramsModule } from '../programs/programs.module';

/**
 * AnalyticsModule
 *
 * Registers the analytics controller and service.
 * Exported so other modules can use AnalyticsService if needed.
 * This module is already imported in AppModule (app.module.ts).
 */
@Module({
  imports: [ProgramsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
