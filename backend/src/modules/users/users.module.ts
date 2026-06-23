import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { XpService } from './services/xp.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, XpService],
  exports: [UsersService, XpService],
})
export class UsersModule {}
