import { Module } from '@nestjs/common';
import { AssessmentController } from './controllers/assessment.controller';
import { AttemptController } from './controllers/attempt.controller';
import { AssessmentService } from './services/assessment.service';
import { QuestionSelectionService } from './services/question-selection.service';
import { AttemptService } from './services/attempt.service';
import { RecommendationService } from './services/recommendation.service';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuditModule, DatabaseModule, UsersModule],
  controllers: [AssessmentController, AttemptController],
  providers: [
    AssessmentService,
    QuestionSelectionService,
    AttemptService,
    RecommendationService,
  ],
  exports: [
    AssessmentService,
    QuestionSelectionService,
    AttemptService,
    RecommendationService,
  ],
})
export class AssessmentsModule {}
