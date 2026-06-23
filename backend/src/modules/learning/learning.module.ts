import { Module } from '@nestjs/common';
import { LearningController } from './controllers/learning.controller';
import { LearningService } from './services/learning.service';
import { LearningActivityService } from './services/learning-activity.service';
import { LearningMilestoneService } from './services/learning-milestone.service';
import { LearningPatternService } from './services/learning-pattern.service';
import { LearningInsightService } from './services/learning-insight.service';
import { LearningRecommendationService } from './services/learning-recommendation.service';
import { ProgramsModule } from '../programs/programs.module';
import { UsersModule } from '../users/users.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [ProgramsModule, UsersModule, AchievementsModule],
  controllers: [LearningController],
  providers: [
    LearningService,
    LearningActivityService,
    LearningMilestoneService,
    LearningPatternService,
    LearningInsightService,
    LearningRecommendationService,
  ],
  exports: [
    LearningService,
    LearningActivityService,
    LearningMilestoneService,
    LearningPatternService,
    LearningInsightService,
    LearningRecommendationService,
  ],
})
export class LearningModule {}
