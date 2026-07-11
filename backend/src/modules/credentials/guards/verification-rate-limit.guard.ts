import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Injectable()
export class VerificationRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(VerificationRateLimitGuard.name);

  // Maps IP -> array of timestamps of requests
  private ipRequests = new Map<string, number[]>();
  // Maps IP -> array of timestamps of FAILED validation requests
  private ipFailures = new Map<string, number[]>();
  // Maps IP -> lockout expiration timestamp
  private ipLockouts = new Map<string, number>();

  // Configuration thresholds
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 10;

  private readonly FAILURE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_FAILURES_BEFORE_LOCKOUT = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const now = Date.now();

    // 1. Check if IP is currently locked out
    const lockoutExpiration = this.ipLockouts.get(ip);
    if (lockoutExpiration) {
      if (now < lockoutExpiration) {
        const secondsLeft = Math.ceil((lockoutExpiration - now) / 1000);
        this.logger.warn(`[RATE_LIMIT] Blocked locked-out IP ${ip} — ${secondsLeft}s remaining`);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Too many failed verification attempts. Access blocked. Try again in ${secondsLeft} seconds.`,
            error: 'Locked Out',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        // Lockout expired, clean it up
        this.ipLockouts.delete(ip);
        this.logger.log(`[RATE_LIMIT] Lockout expired for IP ${ip}`);
      }
    }

    // 2. Check general rate limit (max requests per minute)
    let requests = this.ipRequests.get(ip) || [];
    requests = requests.filter((timestamp) => now - timestamp < this.RATE_LIMIT_WINDOW_MS);
    requests.push(now);
    this.ipRequests.set(ip, requests);

    if (requests.length > this.MAX_REQUESTS_PER_WINDOW) {
      this.logger.warn(`[RATE_LIMIT] Rate limit exceeded for IP ${ip} — ${requests.length} requests in window`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many verification requests. Please try again in a minute.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Records a failed verification attempt (invalid code) for brute-force protection.
   */
  recordFailure(ip: string): void {
    const now = Date.now();
    let failures = this.ipFailures.get(ip) || [];
    failures = failures.filter((timestamp) => now - timestamp < this.FAILURE_WINDOW_MS);
    failures.push(now);
    this.ipFailures.set(ip, failures);

    if (failures.length >= this.MAX_FAILURES_BEFORE_LOCKOUT) {
      this.ipLockouts.set(ip, now + this.LOCKOUT_DURATION_MS);
      // Clear failures once locked out
      this.ipFailures.delete(ip);
    }
  }

  /**
   * Helper to retrieve client IP address.
   */
  private getClientIp(request: any): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const parts = xForwardedFor.split(',');
      return parts[0].trim();
    }
    return request.ip || request.connection.remoteAddress || 'unknown';
  }
}
