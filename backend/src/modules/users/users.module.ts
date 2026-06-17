import { Module } from '@nestjs/common';
import { XpService } from './services/xp.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [XpService],
  exports: [XpService],
})
export class UsersModule {}
