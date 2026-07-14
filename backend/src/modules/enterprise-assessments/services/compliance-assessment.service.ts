import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../database/prisma.service';
import { AuditAction, UserRole, Difficulty } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { EnterpriseQuestionBankService } from './enterprise-question-bank.service';
import {
  CreateComplianceAssessmentDto,
  UpdateComplianceAssessmentDto,
  IngestGeneratedAssessmentDto,
} from '../dto/enterprise-assessment.dto';

@Injectable()
export class ComplianceAssessmentService {
  private readonly logger = new Logger(ComplianceAssessmentService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private enterpriseQuestionBankService: EnterpriseQuestionBankService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ─────────────────── QUESTION SELECTION ───────────────────

  /**
   * Reuses the QuestionSelectionService cache-aside + Fisher-Yates pattern
   * but queries EnterpriseQuestionBank/EnterpriseQuestion instead.
   */
  async selectEnterpriseQuestions(assessmentId: string) {
    const assessment = await this.prisma.complianceAssessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        title: true,
        passingScore: true,
        timeLimit: true,
        sampleSize: true,
        questionBankId: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Compliance assessment with ID ${assessmentId} not found`);
    }

    // Cache-aside: try cache first
    const cacheKey = `ent-qbank:${assessmentId}:questions`;
    let allQuestions: {
      id: string;
      text: string;
      category: string | null;
      timerSeconds: number;
      options: { id: string; text: string }[];
    }[];

    const cached = await this.cacheManager.get<typeof allQuestions>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache HIT for ${cacheKey}`);
      allQuestions = cached;
    } else {
      this.logger.debug(`Cache MISS for ${cacheKey}`);

      const questionBank = await this.prisma.enterpriseQuestionBank.findUnique({
        where: { id: assessment.questionBankId },
        include: {
          questions: {
            include: { options: true },
          },
        },
      });

      const rawQuestions = questionBank?.questions ?? [];

      // Strip isCorrect from options (never expose to client)
      allQuestions = rawQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        timerSeconds: q.timerSeconds,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
      }));

      if (allQuestions.length > 0) {
        await this.cacheManager.set(cacheKey, allQuestions, 300_000);
      }
    }

    if (allQuestions.length === 0) {
      return {
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        passingScore: assessment.passingScore,
        timeLimit: assessment.timeLimit,
        sampleSize: 0,
        totalAvailable: 0,
        questions: [],
      };
    }

    // Clone, shuffle, slice — same as QuestionSelectionService
    const pool = allQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category,
      timerSeconds: q.timerSeconds,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    }));

    this.fisherYatesShuffle(pool);

    const sampleSize = Math.min(assessment.sampleSize, pool.length);
    const selected = pool.slice(0, sampleSize);

    for (const question of selected) {
      this.fisherYatesShuffle(question.options);
    }

    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      passingScore: assessment.passingScore,
      timeLimit: assessment.timeLimit,
      sampleSize,
      totalAvailable: allQuestions.length,
      questions: selected,
    };
  }

  private fisherYatesShuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // ─────────────────── ASSESSMENTS CRUD ───────────────────

  async getAssessments(organizationId?: string, complianceTrack?: string) {
    return this.prisma.complianceAssessment.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(complianceTrack ? { complianceTrack: complianceTrack as any } : {}),
      },
      include: {
        organization: { select: { name: true } },
        department: { select: { name: true } },
        questionBank: {
          select: {
            id: true,
            title: true,
            _count: { select: { questions: true } },
          },
        },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssessmentById(id: string) {
    const assessment = await this.prisma.complianceAssessment.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true } },
        department: { select: { name: true } },
        questionBank: {
          include: {
            _count: { select: { questions: true } },
          },
        },
        _count: { select: { attempts: true } },
      },
    });
    if (!assessment)
      throw new NotFoundException(`Compliance assessment with ID ${id} not found`);
    return assessment;
  }

  async createAssessment(data: CreateComplianceAssessmentDto, userId: string) {
    // Verify the question bank exists and has enough questions (≥10 for enterprise)
    const bank = await this.prisma.enterpriseQuestionBank.findUnique({
      where: { id: data.questionBankId },
      include: { _count: { select: { questions: true } } },
    });
    if (!bank)
      throw new NotFoundException(
        `Enterprise question bank with ID ${data.questionBankId} not found`,
      );

    if (bank._count.questions < 10) {
      throw new BadRequestException(
        `Enterprise question bank must have at least 10 questions to create an assessment. Current count: ${bank._count.questions}`,
      );
    }

    const assessment = await this.prisma.complianceAssessment.create({
      data: {
        organizationId: data.organizationId,
        departmentId: data.departmentId,
        questionBankId: data.questionBankId,
        title: data.title,
        complianceTrack: data.complianceTrack,
        passingScore: data.passingScore ?? 80,
        sampleSize: data.sampleSize ?? 15,
        timeLimit: data.timeLimit ?? 900,
        maxAttempts: data.maxAttempts ?? 3,
        timeLimitEnabled: data.timeLimitEnabled ?? true,
        allowResume: data.allowResume ?? true,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.COMPLIANCE_ASSESSMENT_PUBLISHED,
      `ComplianceAssessment "${assessment.title}" (ID: ${assessment.id}) published`,
    );

    return this.getAssessmentById(assessment.id);
  }

  async updateAssessment(id: string, data: UpdateComplianceAssessmentDto, userId: string) {
    const existing = await this.prisma.complianceAssessment.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Compliance assessment with ID ${id} not found`);

    const assessment = await this.prisma.complianceAssessment.update({
      where: { id },
      data: {
        title: data.title,
        passingScore: data.passingScore,
        sampleSize: data.sampleSize,
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts,
        timeLimitEnabled: data.timeLimitEnabled,
        allowResume: data.allowResume,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.COMPLIANCE_ASSESSMENT_PUBLISHED,
      `ComplianceAssessment "${assessment.title}" (ID: ${assessment.id}) updated`,
    );

    return assessment;
  }

  async deleteAssessment(id: string, userId: string) {
    const existing = await this.prisma.complianceAssessment.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Compliance assessment with ID ${id} not found`);

    await this.prisma.complianceAssessment.delete({ where: { id } });

    await this.auditService.logAction(
      userId,
      AuditAction.COMPLIANCE_ASSESSMENT_PUBLISHED,
      `ComplianceAssessment "${existing.title}" (ID: ${existing.id}) deleted`,
    );
  }

  /**
   * Validates that a user belongs to the same organization as the assessment.
   */
  async validateAssessmentOwnership(
    userId: string,
    assessmentId: string,
    userRole: UserRole,
  ): Promise<true> {
    if (userRole === UserRole.DEZAI_ADMIN) return true;

    const assessment = await this.prisma.complianceAssessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment)
      throw new NotFoundException(`Compliance assessment with ID ${assessmentId} not found`);

    const orgAdmin = await this.prisma.organizationAdmin.findUnique({
      where: { userId },
    });
    if (orgAdmin && orgAdmin.organizationId === assessment.organizationId) {
      return true;
    }

    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (employee && employee.organizationId === assessment.organizationId) {
      return true;
    }

    throw new ForbiddenException(
      'Unauthorized: You do not belong to this assessment\'s organization',
    );
  }

  async ingestGeneratedAssessment(data: IngestGeneratedAssessmentDto, userId: string) {
    if (data.questions.length < 10) {
      throw new BadRequestException('Compliance assessments require at least 10 generated questions.');
    }

    const { organizationId, departmentId, title, complianceTrack, sourceDocumentId, questions } = data;

    // Run in transaction to guarantee complete insertion of all objects
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create AI-generated question bank
      const bank = await tx.enterpriseQuestionBank.create({
        data: {
          title: `${title} - Question Bank`,
          description: `AI-generated compliance questions from document ${sourceDocumentId || 'N/A'}`,
          organizationId,
          departmentId,
          complianceTrack,
          sourceType: 'AI_GENERATED',
          sourceDocumentId,
        },
      });

      // 2. Bulk create questions and options
      for (const q of questions) {
        await tx.enterpriseQuestion.create({
          data: {
            questionBankId: bank.id,
            text: q.text,
            category: q.category,
            difficulty: q.difficulty ?? Difficulty.MEDIUM,
            explanation: q.explanation,
            tags: q.tags ?? [],
            timerSeconds: q.timerSeconds ?? 60,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect ?? false,
              })),
            },
          },
        });
      }

      // 3. Create Compliance Assessment linked to the bank
      const assessment = await tx.complianceAssessment.create({
        data: {
          organizationId,
          departmentId,
          questionBankId: bank.id,
          title,
          complianceTrack,
          passingScore: 80,
          sampleSize: Math.min(15, questions.length),
          timeLimit: 900,
          maxAttempts: 3,
          timeLimitEnabled: true,
          allowResume: true,
        },
      });

      return { bank, assessment };
    });

    await this.auditService.logAction(
      userId,
      AuditAction.COMPLIANCE_ASSESSMENT_PUBLISHED,
      `AI-Generated ComplianceAssessment "${result.assessment.title}" (ID: ${result.assessment.id}) ingested successfully`,
    );

    return this.getAssessmentById(result.assessment.id);
  }
}
