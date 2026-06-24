import { Module } from '@nestjs/common';
import { AssessmentController } from './controllers/assessment.controller';
import { AttemptController } from './controllers/attempt.controller';
import { ResultsController } from './controllers/results.controller';
import { IntelligenceController } from './controllers/intelligence.controller';
import { FacultyInsightsController } from './controllers/faculty-insights.controller';
import { AssessmentService } from './services/assessment.service';
import { QuestionSelectionService } from './services/question-selection.service';
import { AttemptService } from './services/attempt.service';
import { RecommendationService } from './services/recommendation.service';
import { PassFailEvaluationService } from './services/pass-fail-evaluation.service';
import { WeakTopicDetectionService } from './services/weak-topic-detection.service';
import { AssessmentAnalyticsService } from './services/assessment-analytics.service';
import { FacultyInsightService } from './services/faculty-insight.service';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { AchievementsModule } from '../achievements/achievements.module';

// IMPORTANT: CredentialsModule is required for AttemptService to auto-generate credentials upon assessment pass. Do not remove.
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [AuditModule, DatabaseModule, UsersModule, AchievementsModule, CredentialsModule],
  controllers: [
    AssessmentController,
    AttemptController,
    ResultsController,
    IntelligenceController,
    FacultyInsightsController,
  ],
  providers: [
    AssessmentService,
    QuestionSelectionService,
    AttemptService,
    RecommendationService,
    PassFailEvaluationService,
    WeakTopicDetectionService,
    AssessmentAnalyticsService,
    FacultyInsightService,
  ],
  exports: [
    AssessmentService,
    QuestionSelectionService,
    AttemptService,
    RecommendationService,
    PassFailEvaluationService,
    WeakTopicDetectionService,
    AssessmentAnalyticsService,
    FacultyInsightService,
  ],
})
export class AssessmentsModule {}


