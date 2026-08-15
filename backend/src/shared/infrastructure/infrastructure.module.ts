import { Global, Module } from '@nestjs/common';
import { RedisHealthService } from './redis-health.service';

/**
 * Global infrastructure module.
 *
 * Provides cross-cutting services (currently RedisHealthService) that
 * must be shared as singletons across all feature modules.
 * The @Global() decorator makes RedisHealthService injectable anywhere
 * without requiring InfrastructureModule to be imported in each consumer.
 */
@Global()
@Module({
  providers: [RedisHealthService],
  exports: [RedisHealthService],
})
export class InfrastructureModule {}
