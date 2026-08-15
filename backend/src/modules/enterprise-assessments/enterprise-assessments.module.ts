import { Module } from '@nestjs/common';
import { EnterpriseQuestionBankController } from './controllers/enterprise-question-bank.controller';
import { ComplianceAssessmentController } from './controllers/compliance-assessment.controller';
import { ComplianceAttemptController } from './controllers/compliance-attempt.controller';
import { EnterpriseDashboardController } from './controllers/enterprise-dashboard.controller';
import { EnterpriseQuestionBankService } from './services/enterprise-question-bank.service';
import { ComplianceAssessmentService } from './services/compliance-assessment.service';
import { ComplianceAttemptService } from './services/compliance-attempt.service';
import { EnterpriseDashboardService } from './services/enterprise-dashboard.service';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { AssessmentsModule } from '../assessments/assessments.module';

@Module({
  imports: [AuditModule, DatabaseModule, AssessmentsModule],
  controllers: [
    EnterpriseQuestionBankController,
    ComplianceAssessmentController,
    ComplianceAttemptController,
    EnterpriseDashboardController,
  ],
  providers: [
    EnterpriseQuestionBankService,
    ComplianceAssessmentService,
    ComplianceAttemptService,
    EnterpriseDashboardService,
  ],
  exports: [
    EnterpriseQuestionBankService,
    ComplianceAssessmentService,
    ComplianceAttemptService,
    EnterpriseDashboardService,
  ],
})
export class EnterpriseAssessmentsModule {}
