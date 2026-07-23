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
import { EnterpriseCredentialsModule } from './modules/enterprise-credentials/enterprise-credentials.module';
import { EnterpriseAdminModule } from './modules/enterprise-admin/enterprise-admin.module';


import { DepartmentsModule } from './modules/departments/departments.module';
import { UniversityAdminModule } from './modules/university-admin/university-admin.module';
import { PlatformAdminModule } from './modules/platform-admin/platform-admin.module';
import { RbacScopeModule } from './shared/rbac-scope.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const store = config.get<string>('CACHE_STORE', 'memory');

        if (store === 'redis') {
          const { default: KeyvRedis } = await import('@keyv/redis');
          const host = config.get<string>('REDIS_HOST', 'localhost');
          const port = config.get<number>('REDIS_PORT', 6379);
          const password = config.get<string>('REDIS_PASSWORD', '');
          const uri = password
            ? `redis://:${password}@${host}:${port}`
            : `redis://${host}:${port}`;
          return {
            stores: [new KeyvRedis(uri)],
            ttl: 300_000,
          };
        }

        return { ttl: 300_000 }; // in-memory fallback
      },
    }),
    DatabaseModule,
    RbacScopeModule,
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
    EnterpriseCredentialsModule,
    EnterpriseAdminModule,
    DepartmentsModule,
    UniversityAdminModule,
    PlatformAdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

