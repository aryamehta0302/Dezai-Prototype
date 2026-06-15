import { Module } from '@nestjs/common';
import { XpService } from './services/xp.service';

@Module({
  imports: [],
  controllers: [],
  providers: [XpService],
  exports: [XpService],
})
export class UsersModule {}
