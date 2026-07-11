import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { AcademyModule } from './modules/academy/academy.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { LearningModule } from './modules/learning/learning.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LeaderboardsModule } from './modules/leaderboards/leaderboards.module';
import { AuditModule } from './modules/audit/audit.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { EnterpriseAssessmentsModule } from './modules/enterprise-assessments/enterprise-assessments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const store = config.get<string>('CACHE_STORE', 'memory');

        if (store === 'redis') {
          const { redisStore } = await import('cache-manager-ioredis-yet');
          return {
            store: redisStore,
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            password: config.get<string>('REDIS_PASSWORD', ''),
            ttl: 300_000, // 5 minutes in ms
          };
        }

        return { ttl: 300_000 }; // in-memory fallback
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    InstitutionsModule,
    AcademyModule,
    ProgramsModule,
    LearningModule,
    AssessmentsModule,
    CredentialsModule,
    ProjectsModule,
    AnalyticsModule,
    AiModule,
    UploadsModule,
    NotificationsModule,
    LeaderboardsModule,
    AuditModule,
    AchievementsModule,
    EnterpriseAssessmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

