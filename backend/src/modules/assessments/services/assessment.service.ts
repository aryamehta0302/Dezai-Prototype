import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { UserRole, AuditAction } from "@prisma/client";
import { AuditService } from "../../audit/services/audit.service";
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAssessmentDto,
  UpdateAssessmentDto,
} from "../dto/assessment.dto";

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  // ─────────────────── OWNERSHIP GUARD ───────────────────

  /**
   * Validates that the requesting user has ownership/access to a QuestionBank.
   * DEZAI_ADMIN bypasses all checks.
   * UNIVERSITY_ADMIN must belong to the same institution.
   * FACULTY must belong to the same institution as the QuestionBank.
   */
  async validateQuestionBankOwnership(
    userId: string,
    bankId: string,
    userRole: UserRole
  ): Promise<true> {
    if (userRole === UserRole.DEZAI_ADMIN) return true;

    const bank = await this.prisma.questionBank.findUnique({
      where: { id: bankId },
    });
    if (!bank) throw new NotFoundException("Question bank not found");

    if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin || admin.institutionId !== bank.institutionId) {
        throw new ForbiddenException(
          "Unauthorized: Admin institution mismatch"
        );
      }
      return true;
    }

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty)
        throw new ForbiddenException("Faculty profile not found");
      if (faculty.institutionId !== bank.institutionId) {
        throw new ForbiddenException(
          "Unauthorized: You do not belong to this question bank's institution"
        );
      }
      return true;
    }

    throw new ForbiddenException("Unauthorized role");
  }

  // ─────────────────── QUESTION BANKS ───────────────────

  async getQuestionBanks(institutionId?: string) {
    return this.prisma.questionBank.findMany({
      where: institutionId ? { institutionId } : undefined,
      include: {
        institution: { select: { name: true, logoUrl: true } },
        faculty: { include: { user: { select: { name: true } } } },
        _count: { select: { questions: true } },
      },
    });
  }

  async getQuestionBankById(id: string) {
    const bank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        institution: { select: { name: true, logoUrl: true } },
        faculty: { include: { user: { select: { name: true } } } },
        questions: {
          include: { options: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { questions: true } },
      },
    });
    if (!bank)
      throw new NotFoundException(`Question bank with ID ${id} not found`);
    return bank;
  }

  async createQuestionBank(
    userId: string,
    userRole: UserRole,
    data: CreateQuestionBankDto
  ) {
    let institutionId = data.institutionId;
    let facultyId: string | null = null;

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty)
        throw new ForbiddenException(
          "Faculty profile must exist to create a question bank"
        );
      facultyId = faculty.id;
      institutionId = faculty.institutionId;
    } else if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin)
        throw new ForbiddenException(
          "Admin profile must exist to create a question bank"
        );
      institutionId = admin.institutionId;
    }

    if (!institutionId)
      throw new ForbiddenException("An institutionId is required");

    const bank = await this.prisma.questionBank.create({
      data: {
        title: data.title,
        description: data.description,
        institutionId,
        facultyId,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `QuestionBank "${bank.title}" (ID: ${bank.id}) created by ${userRole}`
    );

    return this.getQuestionBankById(bank.id);
  }

  async updateQuestionBank(
    id: string,
    data: UpdateQuestionBankDto,
    userId: string
  ) {
    const bank = await this.prisma.questionBank.update({
      where: { id },
      data,
    });
    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `QuestionBank "${bank.title}" (ID: ${bank.id}) updated`
    );
    return bank;
  }

  async deleteQuestionBank(id: string, userId: string) {
    const bank = await this.prisma.questionBank.delete({ where: { id } });
    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `QuestionBank "${bank.title}" (ID: ${bank.id}) deleted`
    );
  }

  // ─────────────────── QUESTIONS ───────────────────

  async createQuestion(bankId: string, data: CreateQuestionDto, userId: string) {
    // Verify the bank exists
    const bank = await this.prisma.questionBank.findUnique({
      where: { id: bankId },
    });
    if (!bank)
      throw new NotFoundException(`Question bank with ID ${bankId} not found`);

    const question = await this.prisma.questionBankQuestion.create({
      data: {
        questionBankId: bankId,
        text: data.text,
        category: data.category,
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
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${question.id}) added to QuestionBank "${bank.title}" (ID: ${bankId})`
    );

    return question;
  }

  async updateQuestion(questionId: string, data: UpdateQuestionDto, userId: string) {
    const existing = await this.prisma.questionBankQuestion.findUnique({
      where: { id: questionId },
    });
    if (!existing)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    const question = await this.prisma.questionBankQuestion.update({
      where: { id: questionId },
      data: {
        text: data.text,
        category: data.category,
        timerSeconds: data.timerSeconds,
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${questionId}) updated`
    );

    return question;
  }

  async deleteQuestion(questionId: string, userId: string) {
    const existing = await this.prisma.questionBankQuestion.findUnique({
      where: { id: questionId },
    });
    if (!existing)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    // Cascade deletes QuestionOption rows via Prisma schema onDelete: Cascade
    await this.prisma.questionBankQuestion.delete({
      where: { id: questionId },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${questionId}) deleted from QuestionBank (ID: ${existing.questionBankId})`
    );
  }

  async duplicateQuestion(questionId: string, userId: string) {
    const original = await this.prisma.questionBankQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });
    if (!original)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    const duplicate = await this.prisma.questionBankQuestion.create({
      data: {
        questionBankId: original.questionBankId,
        text: `${original.text} (Copy)`,
        category: original.category,
        timerSeconds: original.timerSeconds,
        options: {
          create: original.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${questionId}) duplicated as (ID: ${duplicate.id})`
    );

    return duplicate;
  }

  // ─────────────────── ASSESSMENTS ───────────────────

  async getAssessmentsByModule(moduleId: string) {
    return this.prisma.assessment.findMany({
      where: { moduleId },
      include: {
        questionBank: {
          select: {
            id: true,
            title: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });
  }

  async getAssessmentById(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, title: true } },
        questionBank: {
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    });
    if (!assessment)
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    return assessment;
  }

  async createAssessment(data: CreateAssessmentDto, userId: string) {
    // Verify the module exists
    const moduleExists = await this.prisma.module.findUnique({
      where: { id: data.moduleId },
    });
    if (!moduleExists)
      throw new NotFoundException(
        `Module with ID ${data.moduleId} not found`
      );

    // Verify the question bank exists and has ≥ 100 questions
    const bank = await this.prisma.questionBank.findUnique({
      where: { id: data.questionBankId },
      include: { _count: { select: { questions: true } } },
    });
    if (!bank)
      throw new NotFoundException(
        `Question bank with ID ${data.questionBankId} not found`
      );

    if (bank._count.questions < 100) {
      throw new BadRequestException(
        `Question bank must have at least 100 questions to create an assessment. Current count: ${bank._count.questions}`
      );
    }

    const assessment = await this.prisma.assessment.create({
      data: {
        moduleId: data.moduleId,
        questionBankId: data.questionBankId,
        title: data.title,
        passingScore: data.passingScore ?? 80,
        sampleSize: data.sampleSize ?? 15,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Assessment "${assessment.title}" (ID: ${assessment.id}) published for Module (ID: ${data.moduleId})`
    );

    return this.getAssessmentById(assessment.id);
  }

  async updateAssessment(
    id: string,
    data: UpdateAssessmentDto,
    userId: string
  ) {
    const existing = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Assessment with ID ${id} not found`);

    const assessment = await this.prisma.assessment.update({
      where: { id },
      data: {
        title: data.title,
        passingScore: data.passingScore,
        sampleSize: data.sampleSize,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Assessment "${assessment.title}" (ID: ${assessment.id}) updated`
    );

    return assessment;
  }

  async deleteAssessment(id: string, userId: string) {
    const existing = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Assessment with ID ${id} not found`);

    await this.prisma.assessment.delete({ where: { id } });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Assessment "${existing.title}" (ID: ${existing.id}) deleted`
    );
  }

  // ─────────────────── FACULTY ANALYTICS ───────────────────

  /**
   * Compute analytics for an assessment from AssessmentAttempt rows.
   * Only considers completed attempts (completedAt is not null).
   */
  async getAssessmentAnalytics(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment)
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`
      );

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      select: {
        score: true,
        passed: true,
      },
    });

    const total = attempts.length;

    if (total === 0) {
      return {
        total: 0,
        passRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const passedCount = attempts.filter((a) => a.passed).length;
    const scores = attempts.map((a) => a.score);
    const sum = scores.reduce((acc, s) => acc + s, 0);

    return {
      total,
      passRate: Math.round((passedCount / total) * 100 * 100) / 100,
      averageScore: Math.round((sum / total) * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    };
  }
}
