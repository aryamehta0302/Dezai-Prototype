import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CredentialsService } from './services/credentials.service';
import { CredentialsController } from './controllers/credentials.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}


