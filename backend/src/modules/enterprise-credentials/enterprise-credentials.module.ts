import { Module } from '@nestjs/common';
import { EnterpriseCredentialsController } from './controllers/enterprise-credentials.controller';
import { EnterpriseCredentialsService } from './services/enterprise-credentials.service';
import { EnterpriseCredentialsRepository } from './repositories/enterprise-credentials.repository';
import { EnterpriseTemplateService } from './services/enterprise-template.service';

import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [DatabaseModule, AuditModule, NotificationsModule],
    controllers: [EnterpriseCredentialsController],
    providers: [
        EnterpriseCredentialsService,
        EnterpriseCredentialsRepository,
        EnterpriseTemplateService,
    ],
    exports: [EnterpriseCredentialsService, EnterpriseTemplateService],
})
export class EnterpriseCredentialsModule { }
