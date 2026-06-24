import { Module, forwardRef } from '@nestjs/common';
import { ProgramsController } from './controllers/programs.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { ProgramsService } from './services/programs.service';
import { EnrollmentService } from './services/enrollment.service';
// IMPORTANT: CredentialsModule is required for EnrollmentService to auto-generate credentials upon program completion. Do not remove.
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [CredentialsModule],
  controllers: [ProgramsController, EnrollmentController],
  providers: [ProgramsService, EnrollmentService],
  exports: [ProgramsService, EnrollmentService],
})
export class ProgramsModule {}
