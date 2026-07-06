import { Module } from '@nestjs/common';
import { CredentialsController } from './controllers/credentials.controller';
import { CredentialsService } from './services/credentials.service';
import { CredentialsRepository } from './repositories/credentials.repository';
import { TemplateService } from './services/template.service';
import { VerificationRateLimitGuard } from './guards/verification-rate-limit.guard';

import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, AuditModule, NotificationsModule],
  controllers: [CredentialsController],
  providers: [
    CredentialsService,
    CredentialsRepository,
    TemplateService,
    VerificationRateLimitGuard,
  ],
  exports: [CredentialsService, TemplateService, VerificationRateLimitGuard],
})
export class CredentialsModule { }
