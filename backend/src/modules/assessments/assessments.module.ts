import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { AssessmentsController } from './controllers/assessments.controller';
import { AssessmentsService } from './services/assessments.service';

@Module({
  imports: [DatabaseModule, CredentialsModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}


