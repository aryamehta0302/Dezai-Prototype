import { Module } from '@nestjs/common';
import { InstitutionsController } from './controllers/institutions.controller';
import { InstitutionsService } from './services/institutions.service';

@Module({
  imports: [],
  controllers: [InstitutionsController],
  providers: [InstitutionsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
