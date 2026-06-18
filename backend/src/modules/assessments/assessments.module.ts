import { Module } from '@nestjs/common';
import { AssessmentController } from './controllers/assessment.controller';
import { AssessmentService } from './services/assessment.service';
import { QuestionSelectionService } from './services/question-selection.service';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AuditModule, DatabaseModule],
  controllers: [AssessmentController],
  providers: [AssessmentService, QuestionSelectionService],
  exports: [AssessmentService, QuestionSelectionService],
})
export class AssessmentsModule {}
