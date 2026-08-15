import { Module } from '@nestjs/common';
import { EnterpriseAdminController } from './controllers/enterprise-admin.controller';
import { EnterpriseAdminService } from './services/enterprise-admin.service';
import { EnterpriseAdminRepository } from './repositories/enterprise-admin.repository';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    DatabaseModule, // provides PrismaService
    AuditModule,    // provides AuditService (@Global, so import is optional but explicit for clarity)
  ],
  controllers: [EnterpriseAdminController],
  providers: [
    EnterpriseAdminService,
    EnterpriseAdminRepository,
  ],
  exports: [EnterpriseAdminService],
})
export class EnterpriseAdminModule {}
