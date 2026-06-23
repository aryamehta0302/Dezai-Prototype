import { Module } from '@nestjs/common';
import { AssessmentController } from './controllers/assessment.controller';
import { AttemptController } from './controllers/attempt.controller';
import { ResultsController } from './controllers/results.controller';
import { AssessmentService } from './services/assessment.service';
import { QuestionSelectionService } from './services/question-selection.service';
import { AttemptService } from './services/attempt.service';
import { RecommendationService } from './services/recommendation.service';
import { PassFailEvaluationService } from './services/pass-fail-evaluation.service';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [AuditModule, DatabaseModule, UsersModule, AchievementsModule],
  controllers: [AssessmentController, AttemptController, ResultsController],
  providers: [
    AssessmentService,
    QuestionSelectionService,
    AttemptService,
    RecommendationService,
    PassFailEvaluationService,
  ],
  exports: [
    AssessmentService,
    QuestionSelectionService,
    AttemptService,
    RecommendationService,
    PassFailEvaluationService,
  ],
})
export class AssessmentsModule {}

