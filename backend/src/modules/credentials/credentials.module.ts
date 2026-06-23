import { Module } from '@nestjs/common';
import { CredentialGenerationController } from './controllers/credential-generation.controller';
import { CredentialVerificationController } from './controllers/credential-verification.controller';
import { CredentialStateController } from './controllers/credential-state.controller';
import { CredentialGenerationService } from './services/credential-generation.service';
import { CredentialVerificationService } from './services/credential-verification.service';
import { CredentialStateService } from './services/credential-state.service';
import { CredentialsRepository } from './repositories/credentials.repository';

@Module({
  controllers: [
    CredentialGenerationController,
    CredentialVerificationController,
    CredentialStateController,
  ],
  providers: [
    CredentialGenerationService,
    CredentialVerificationService,
    CredentialStateService,
    CredentialsRepository,
  ],
  exports: [
    CredentialGenerationService,
    CredentialVerificationService,
    CredentialStateService,
  ],
})
export class CredentialsModule {}