import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    for (let i = 0; i < 3; i++) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully.');
        return;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (i < 2) {
          this.logger.warn(`DB connection attempt ${i + 1} failed: ${msg}. Retrying in ${(i + 1) * 2}s...`);
          await new Promise((r) => setTimeout(r, (i + 1) * 2000));
        } else {
          this.logger.error(`DB connection failed after 3 attempts: ${msg}`);
        }
      }
    }
  }

  private readonly P1001_RETRIES = 2;
  private readonly P1001_DELAY_MS = 3000;

  async retryOnWakeup<T>(fn: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= this.P1001_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        const code = (error as Record<string, unknown> | null)?.code;
        const isP1001 =
          code === 'P1001' || (error instanceof Error && error.message.includes('Can\'t reach database server'));
        if (isP1001 && attempt < this.P1001_RETRIES) {
          this.logger.warn(`P1001 hit (attempt ${attempt + 1}/${this.P1001_RETRIES}), waiting ${this.P1001_DELAY_MS}ms for Neon wake-up...`);
          await new Promise((r) => setTimeout(r, this.P1001_DELAY_MS));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Unreachable');
  }
}
