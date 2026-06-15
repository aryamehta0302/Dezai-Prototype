import { Module } from '@nestjs/common';
import { LearningController } from './controllers/learning.controller';
import { LearningService } from './services/learning.service';
import { ProgramsModule } from '../programs/programs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ProgramsModule, UsersModule],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
