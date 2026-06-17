import { Module } from '@nestjs/common';
import { AssessmentController } from './controllers/assessment.controller';
import { AssessmentService } from './services/assessment.service';
import { QuestionSelectionService } from './services/question-selection.service';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { AssessmentsController } from './controllers/assessments.controller';
import { AssessmentsService } from './services/assessments.service';

@Module({
  imports: [AuditModule, DatabaseModule],
  controllers: [AssessmentController, AssessmentsController],
  providers: [AssessmentService, AssessmentsService, QuestionSelectionService],
  exports: [AssessmentService, AssessmentsService, QuestionSelectionService],
})
export class AssessmentsModule {}
