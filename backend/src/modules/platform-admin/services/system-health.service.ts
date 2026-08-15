import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SystemHealthService {
  constructor(private prisma: PrismaService) {}

  async getSystemHealth() {
    const startTime = Date.now();
    let dbStatus = 'HEALTHY';
    let dbLatencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
    } catch (error) {
      dbStatus = 'UNHEALTHY';
    }

    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'HEALTHY' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(uptimeSeconds),
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        memory: {
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        },
      },
    };
  }
}
