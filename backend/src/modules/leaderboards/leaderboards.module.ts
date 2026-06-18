import { Module } from '@nestjs/common';
import { LeaderboardsController } from './controllers/leaderboards.controller';
import { LeaderboardsService } from './services/leaderboards.service';

/**
 * LeaderboardsModule
 *
 * Registers the leaderboards controller and service.
 * LeaderboardsService is exported so other modules can use
 * leaderboard data programmatically in future sprints.
 *
 * Must be imported in AppModule (app.module.ts) — see Step 13.
 *
 * No external module imports needed:
 *   - PrismaService is provided globally via DatabaseModule (already in AppModule).
 *   - JwtAuthGuard and RolesGuard are self-contained and injected per-route.
 */
@Module({
  imports: [],
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService],
  exports: [LeaderboardsService],
})
export class LeaderboardsModule {}
