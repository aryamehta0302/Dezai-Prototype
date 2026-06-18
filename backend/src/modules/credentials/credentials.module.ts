import { Module } from '@nestjs/common';
import { CredentialController } from './controllers/credential.controller';
import { CredentialService } from './services/credential.service';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AuditModule, DatabaseModule],
  controllers: [CredentialController],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialsModule {}
