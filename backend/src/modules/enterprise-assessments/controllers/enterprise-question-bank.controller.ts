import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { EnterpriseQuestionBankService } from '../services/enterprise-question-bank.service';
import { ComplianceAssessmentService } from '../services/compliance-assessment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateEnterpriseQuestionBankDto,
  UpdateEnterpriseQuestionBankDto,
  CreateEnterpriseQuestionDto,
  UpdateEnterpriseQuestionDto,
  IngestGeneratedAssessmentDto,
} from '../dto/enterprise-assessment.dto';

@Controller('enterprise/assessments')
@UseGuards(JwtAuthGuard)
export class EnterpriseQuestionBankController {
  constructor(
    private readonly questionBankService: EnterpriseQuestionBankService,
    private readonly complianceAssessmentService: ComplianceAssessmentService,
  ) {}

  @Post('generated')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async ingestGeneratedAssessment(@Req() req, @Body() body: IngestGeneratedAssessmentDto) {
    const assessment = await this.complianceAssessmentService.ingestGeneratedAssessment(
      body,
      req.user.id,
    );
    return { success: true, assessment };
  }

  // ─────────────────── QUESTION BANKS ───────────────────

  @Get('question-banks')
  async getQuestionBanks(
    @Query('organizationId') organizationId?: string,
    @Query('complianceTrack') complianceTrack?: string,
  ) {
    const questionBanks = await this.questionBankService.getQuestionBanks(
      organizationId,
      complianceTrack,
    );
    return { success: true, questionBanks };
  }

  @Get('question-banks/:id')
  async getQuestionBankById(@Param('id') id: string) {
    const questionBank = await this.questionBankService.getQuestionBankById(id);
    return { success: true, questionBank };
  }

  @Post('question-banks')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async createQuestionBank(@Req() req, @Body() body: CreateEnterpriseQuestionBankDto) {
    const questionBank = await this.questionBankService.createQuestionBank(
      req.user.id,
      body,
    );
    return { success: true, questionBank };
  }

  @Put('question-banks/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async updateQuestionBank(
    @Param('id') id: string,
    @Req() req,
    @Body() body: UpdateEnterpriseQuestionBankDto,
  ) {
    await this.questionBankService.validateEnterpriseQuestionBankOwnership(
      req.user.id,
      id,
      req.user.role as UserRole,
    );
    const questionBank = await this.questionBankService.updateQuestionBank(
      id,
      body,
      req.user.id,
    );
    return { success: true, questionBank };
  }

  @Delete('question-banks/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async deleteQuestionBank(@Param('id') id: string, @Req() req) {
    await this.questionBankService.validateEnterpriseQuestionBankOwnership(
      req.user.id,
      id,
      req.user.role as UserRole,
    );
    await this.questionBankService.deleteQuestionBank(id, req.user.id);
    return { success: true, message: 'Enterprise question bank deleted' };
  }

  // ─────────────────── QUESTIONS ───────────────────

  @Post('question-banks/:bankId/questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async createQuestion(
    @Param('bankId') bankId: string,
    @Req() req,
    @Body() body: CreateEnterpriseQuestionDto,
  ) {
    await this.questionBankService.validateEnterpriseQuestionBankOwnership(
      req.user.id,
      bankId,
      req.user.role as UserRole,
    );
    const question = await this.questionBankService.createQuestion(
      bankId,
      body,
      req.user.id,
    );
    return { success: true, question };
  }

  @Put('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Req() req,
    @Body() body: UpdateEnterpriseQuestionDto,
  ) {
    const question = await this.questionBankService.updateQuestion(
      questionId,
      body,
      req.user.id,
    );
    return { success: true, question };
  }

  @Delete('questions/:questionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN)
  async deleteQuestion(@Param('questionId') questionId: string, @Req() req) {
    await this.questionBankService.deleteQuestion(questionId, req.user.id);
    return { success: true, message: 'Enterprise question deleted' };
  }
}
