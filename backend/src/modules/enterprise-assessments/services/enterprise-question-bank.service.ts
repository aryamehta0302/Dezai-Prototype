import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../database/prisma.service';
import { AuditAction, Difficulty, UserRole } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import {
  CreateEnterpriseQuestionBankDto,
  UpdateEnterpriseQuestionBankDto,
  CreateEnterpriseQuestionDto,
  UpdateEnterpriseQuestionDto,
} from '../dto/enterprise-assessment.dto';

@Injectable()
export class EnterpriseQuestionBankService {
  private readonly logger = new Logger(EnterpriseQuestionBankService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ─────────────────── CACHE INVALIDATION ───────────────────

  /**
   * Invalidates cached question pools for all compliance assessments linked to a bank.
   * Mirrors university AssessmentService.invalidateQuestionBankCache().
   */
  private async invalidateQuestionBankCache(bankId: string): Promise<void> {
    const assessments = await this.prisma.complianceAssessment.findMany({
      where: { questionBankId: bankId },
      select: { id: true },
    });

    for (const assessment of assessments) {
      const cacheKey = `ent-qbank:${assessment.id}:questions`;
      await this.cacheManager.del(cacheKey);
      this.logger.debug(`Cache INVALIDATED: ${cacheKey}`);
    }
  }

  // ─────────────────── OWNERSHIP VALIDATION ───────────────────

  /**
   * Validates that the requesting user has ownership/access to an EnterpriseQuestionBank.
   * Mirrors validateQuestionBankOwnership() but scoped to organizationId/departmentId.
   *
   * DEZAI_ADMIN bypasses all checks.
   * Other roles must have an OrganizationAdmin or Employee record in the same org.
   */
  async validateEnterpriseQuestionBankOwnership(
    userId: string,
    bankId: string,
    userRole: UserRole,
  ): Promise<true> {
    if (userRole === UserRole.DEZAI_ADMIN) return true;

    const bank = await this.prisma.enterpriseQuestionBank.findUnique({
      where: { id: bankId },
    });
    if (!bank) throw new NotFoundException('Enterprise question bank not found');

    // Check OrganizationAdmin
    const orgAdmin = await this.prisma.organizationAdmin.findUnique({
      where: { userId },
    });
    if (orgAdmin && orgAdmin.organizationId === bank.organizationId) {
      return true;
    }

    // Check Employee
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (employee && employee.organizationId === bank.organizationId) {
      return true;
    }

    throw new ForbiddenException(
      'Unauthorized: You do not belong to this question bank\'s organization',
    );
  }

  // ─────────────────── QUESTION BANKS ───────────────────

  async getQuestionBanks(organizationId?: string, complianceTrack?: string) {
    return this.prisma.enterpriseQuestionBank.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(complianceTrack ? { complianceTrack: complianceTrack as any } : {}),
      },
      include: {
        organization: { select: { name: true, logoUrl: true } },
        department: { select: { name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuestionBankById(id: string) {
    const bank = await this.prisma.enterpriseQuestionBank.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true, logoUrl: true } },
        department: { select: { name: true } },
        questions: {
          include: { options: true },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { questions: true } },
      },
    });
    if (!bank)
      throw new NotFoundException(`Enterprise question bank with ID ${id} not found`);
    return bank;
  }

  async createQuestionBank(userId: string, data: CreateEnterpriseQuestionBankDto) {
    const bank = await this.prisma.enterpriseQuestionBank.create({
      data: {
        title: data.title,
        description: data.description,
        organizationId: data.organizationId,
        departmentId: data.departmentId,
        complianceTrack: data.complianceTrack,
        sourceType: data.sourceType ?? 'MANUAL',
        sourceDocumentId: data.sourceDocumentId,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ENTERPRISE_QUESTION_BANK_CREATED,
      `EnterpriseQuestionBank "${bank.title}" (ID: ${bank.id}) created`,
    );

    return this.getQuestionBankById(bank.id);
  }

  async updateQuestionBank(
    id: string,
    data: UpdateEnterpriseQuestionBankDto,
    userId: string,
  ) {
    const bank = await this.prisma.enterpriseQuestionBank.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        complianceTrack: data.complianceTrack,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ENTERPRISE_QUESTION_BANK_UPDATED,
      `EnterpriseQuestionBank "${bank.title}" (ID: ${bank.id}) updated`,
    );

    await this.invalidateQuestionBankCache(id);

    return bank;
  }

  async deleteQuestionBank(id: string, userId: string) {
    await this.invalidateQuestionBankCache(id);

    const bank = await this.prisma.enterpriseQuestionBank.delete({ where: { id } });
    await this.auditService.logAction(
      userId,
      AuditAction.ENTERPRISE_QUESTION_BANK_DELETED,
      `EnterpriseQuestionBank "${bank.title}" (ID: ${bank.id}) deleted`,
    );
  }

  // ─────────────────── QUESTIONS ───────────────────

  async createQuestion(bankId: string, data: CreateEnterpriseQuestionDto, userId: string) {
    const bank = await this.prisma.enterpriseQuestionBank.findUnique({
      where: { id: bankId },
    });
    if (!bank)
      throw new NotFoundException(`Enterprise question bank with ID ${bankId} not found`);

    const question = await this.prisma.enterpriseQuestion.create({
      data: {
        questionBankId: bankId,
        text: data.text,
        category: data.category,
        difficulty: data.difficulty ?? Difficulty.MEDIUM,
        explanation: data.explanation,
        tags: data.tags ?? [],
        timerSeconds: data.timerSeconds ?? 60,
        options: {
          create: data.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
          })),
        },
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ENTERPRISE_QUESTION_BANK_UPDATED,
      `EnterpriseQuestion (ID: ${question.id}) added to bank "${bank.title}" (ID: ${bankId})`,
    );

    await this.invalidateQuestionBankCache(bankId);

    return question;
  }

  async updateQuestion(questionId: string, data: UpdateEnterpriseQuestionDto, userId: string) {
    const existing = await this.prisma.enterpriseQuestion.findUnique({
      where: { id: questionId },
    });
    if (!existing)
      throw new NotFoundException(`Enterprise question with ID ${questionId} not found`);

    const question = await this.prisma.enterpriseQuestion.update({
      where: { id: questionId },
      data: {
        text: data.text,
        category: data.category,
        difficulty: data.difficulty,
        explanation: data.explanation,
        tags: data.tags,
        timerSeconds: data.timerSeconds,
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ENTERPRISE_QUESTION_BANK_UPDATED,
      `EnterpriseQuestion (ID: ${questionId}) updated`,
    );

    await this.invalidateQuestionBankCache(existing.questionBankId);

    return question;
  }

  async deleteQuestion(questionId: string, userId: string) {
    const existing = await this.prisma.enterpriseQuestion.findUnique({
      where: { id: questionId },
    });
    if (!existing)
      throw new NotFoundException(`Enterprise question with ID ${questionId} not found`);

    await this.prisma.enterpriseQuestion.delete({ where: { id: questionId } });

    await this.auditService.logAction(
      userId,
      AuditAction.ENTERPRISE_QUESTION_BANK_UPDATED,
      `EnterpriseQuestion (ID: ${questionId}) deleted from bank (ID: ${existing.questionBankId})`,
    );

    await this.invalidateQuestionBankCache(existing.questionBankId);
  }
}
