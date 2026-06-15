import { Module } from '@nestjs/common';
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
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
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
    AuditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
