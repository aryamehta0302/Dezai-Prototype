import { Module } from '@nestjs/common';
import { CredentialGenerationController } from './controllers/credential-generation.controller';
import { CredentialVerificationController } from './controllers/credential-verification.controller';
import { CredentialStateController } from './controllers/credential-state.controller';
import { CredentialQueryController } from './controllers/credential-query.controller';
import { CredentialGenerationService } from './services/credential-generation.service';
import { CredentialVerificationService } from './services/credential-verification.service';
import { CredentialStateService } from './services/credential-state.service';
import { CredentialQueryService } from './services/credential-query.service';
import { CredentialsRepository } from './repositories/credentials.repository';

@Module({
  controllers: [
    CredentialGenerationController,
    CredentialVerificationController,
    CredentialStateController,
    CredentialQueryController,
  ],
  providers: [
    CredentialGenerationService,
    CredentialVerificationService,
    CredentialStateService,
    CredentialQueryService,
    CredentialsRepository,
  ],
  exports: [
    CredentialGenerationService,
    CredentialVerificationService,
    CredentialStateService,
    CredentialQueryService,
  ],
})
export class CredentialsModule {}