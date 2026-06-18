import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';

/**
 * NotificationsModule
 *
 * Registers the notifications controller and service.
 * NotificationsService is exported so other modules can create
 * notifications programmatically in future sprints.
 *
 * Already imported in AppModule (app.module.ts) — no changes to AppModule needed
 * for this module. Only LeaderboardsModule requires an AppModule addition.
 */
@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
