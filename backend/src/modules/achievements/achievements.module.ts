import { Module } from '@nestjs/common';
import { AchievementsController } from './controllers/achievements.controller';
import { RulesEngineService } from './services/rules-engine.service';
import { AwardService } from './services/award.service';
import { UserAchievementService } from './services/user-achievement.service';
import { DefinitionService } from './services/definition.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AchievementsController],
  providers: [
    DefinitionService,
    RulesEngineService,
    AwardService,
    UserAchievementService,
  ],
  exports: [
    AwardService,
    UserAchievementService,
    DefinitionService,
  ],
})
export class AchievementsModule {}
