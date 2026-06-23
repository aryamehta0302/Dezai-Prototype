import { Module } from '@nestjs/common';
import { CredentialsController } from './controllers/credentials.controller';
import { CredentialsService } from './services/credentials.service';
import { CredentialsRepository } from './repositories/credentials.repository';
import { TemplateService } from './services/template.service';

import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [DatabaseModule, AuditModule],
  controllers: [CredentialsController],
  providers: [CredentialsService, CredentialsRepository, TemplateService],
  exports: [CredentialsService, TemplateService],
})
export class CredentialsModule { }
