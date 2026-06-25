import { Module } from '@nestjs/common';
import { ProgramsController } from './controllers/programs.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { ProgramsService } from './services/programs.service';
import { EnrollmentService } from './services/enrollment.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [ProgramsController, EnrollmentController],
  providers: [ProgramsService, EnrollmentService],
  exports: [ProgramsService, EnrollmentService],
})
export class ProgramsModule {}
