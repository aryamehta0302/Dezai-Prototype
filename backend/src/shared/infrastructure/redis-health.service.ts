import { Injectable, Logger } from '@nestjs/common';

/**
 * Circuit breaker for Redis cache operations.
 *
 * Tracks whether Redis is reachable and provides a backoff mechanism
 * to avoid hammering a downed Redis with connection attempts on every request.
 *
 * State machine:
 *   available=true  →  Redis is healthy, cache operations proceed normally
 *   available=false →  Redis is down, cache ops are skipped until the next
 *                      backoff interval elapses (a "half-open" probe)
 *
 * The backoff mechanism: when Redis is down, the breaker waits 30 seconds
 * before attempting another cache operation. If it succeeds, Redis is
 * marked available again. If it fails, the backoff resets.
 */
@Injectable()
export class RedisHealthService {
  private readonly logger = new Logger(RedisHealthService.name);

  /** Whether Redis is currently believed to be reachable. */
  private available = true;

  /** Timestamp (epoch ms) of the last failed cache operation. */
  private lastFailureAt = 0;

  /**
   * Minimum time (ms) to wait after a failure before attempting Redis again.
   * 30 seconds balances fast recovery with avoiding repeated failures.
   */
  private static readonly BACKOFF_MS = 30_000;

  /**
   * Returns the current availability state.
   * Used for fire-and-forget operations (set, del) where we don't
   * want to probe — just skip if Redis is known down.
   */
  get isAvailable(): boolean {
    return this.available;
  }

  /**
   * Returns true if a cache operation should be attempted.
   * Always returns true when Redis is believed available.
   * When Redis is down, returns true once per BACKOFF_MS interval
   * to act as a "half-open" probe.
   */
  shouldTry(): boolean {
    if (this.available) return true;
    return Date.now() - this.lastFailureAt > RedisHealthService.BACKOFF_MS;
  }

  /** Mark Redis as reachable after a successful operation. */
  recordSuccess(): void {
    if (!this.available) {
      this.available = true;
      this.logger.log('Redis is reachable again — cache operations resumed');
    }
  }

  /**
   * Mark Redis as unreachable after a failed operation.
   * Records the failure timestamp to begin the backoff window.
   */
  recordFailure(): void {
    this.available = false;
    this.lastFailureAt = Date.now();
  }
}
