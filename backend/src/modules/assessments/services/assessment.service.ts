import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  Logger,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../../../database/prisma.service";
import { UserRole, AuditAction, ExamStatus, ViolationType, Difficulty, AchievementCategory, Prisma } from "@prisma/client";
import { AuditService } from "../../audit/services/audit.service";
import { PassFailEvaluationService } from './pass-fail-evaluation.service';
import { AwardService } from '../../achievements/services/award.service';
import type {
  ResultAnalyticsResponseDto,
  MissedQuestionsAnalyticsResponseDto,
} from '../dto/result.dto';
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAssessmentDto,
  UpdateAssessmentDto,
} from "../dto/assessment.dto";

// ─────────────────── SHUFFLE UTILITY ───────────────────

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}



@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private passFailEvaluationService: PassFailEvaluationService,
    private awardService: AwardService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  // ─────────────────── SPRINT 7: CACHE INVALIDATION ───────────────────

  /**
   * Invalidates cached question pools for all assessments linked to a question bank.
   * Called when questions or banks are created/updated/deleted.
   */
  private async invalidateQuestionBankCache(bankId: string): Promise<void> {
    const assessments = await this.prisma.assessment.findMany({
      where: { questionBankId: bankId },
      select: { id: true },
    });

    for (const assessment of assessments) {
      const cacheKey = `qbank:${assessment.id}:questions`;
      await this.cacheManager.del(cacheKey);
      this.logger.debug(`Cache INVALIDATED: ${cacheKey}`);
    }
  }

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

    await this.invalidateQuestionBankCache(bank.id);

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

    await this.invalidateQuestionBankCache(id);

    return bank;
  }

  async deleteQuestionBank(id: string, userId: string) {
    await this.invalidateQuestionBankCache(id);

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
        difficulty: data.difficulty ?? Difficulty.MEDIUM,
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
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${question.id}) added to QuestionBank "${bank.title}" (ID: ${bankId})`
    );

    await this.invalidateQuestionBankCache(bankId);

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
        difficulty: data.difficulty,
        tags: data.tags,
        timerSeconds: data.timerSeconds,
      },
      include: { options: true },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Question (ID: ${questionId}) updated`
    );

    await this.invalidateQuestionBankCache(existing.questionBankId);

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

    await this.invalidateQuestionBankCache(existing.questionBankId);
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
        difficulty: original.difficulty,
        tags: original.tags,
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

    await this.invalidateQuestionBankCache(original.questionBankId);

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
        timeLimit: data.timeLimit ?? 1800,
        maxAttempts: data.maxAttempts ?? 8,
        timeLimitEnabled: data.timeLimitEnabled ?? true,
        allowResume: data.allowResume ?? true,
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
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts,
        timeLimitEnabled: data.timeLimitEnabled,
        allowResume: data.allowResume,
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

  async getAssessmentResults(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`
      );
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            violations: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      studentName: attempt.user.name || attempt.user.email,
      studentEmail: attempt.user.email,
      score: attempt.score,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      violationCount: attempt._count.violations,
    }));
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
    const percentages = attempts.map((a) =>
      a.score > assessment.sampleSize
        ? a.score
        : this.passFailEvaluationService.calculatePercentage(a.score, assessment.sampleSize)
    );
    const sum = percentages.reduce((acc, s) => acc + s, 0);

    return {
      total,
      passRate: Math.round((passedCount / total) * 100 * 100) / 100,
      averageScore: Math.round((sum / total) * 100) / 100,
      highestScore: Math.max(...percentages),
      lowestScore: Math.min(...percentages),
    };
  }

  // ─────────────────── EXAM SESSIONS & PROCTORING ───────────────────

  /**
 * Samples `sampleSize` random questions from the assessment's question bank,
 * shuffles question order and each question's option order, and returns
 * a locked, JSON-serializable structure to store on the ExamSession.
 */
  async generateQuestionSet(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questionBank: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const allQuestions = assessment.questionBank.questions;

    if (allQuestions.length < assessment.sampleSize) {
      throw new BadRequestException(
        `Question bank only has ${allQuestions.length} questions, but assessment requires ${assessment.sampleSize}.`
      );
    }

    // 1. Randomly select `sampleSize` questions (no repeats)
    const shuffledPool = shuffleArray(allQuestions);
    const selected = shuffledPool.slice(0, assessment.sampleSize);

    // 2. Shuffle each selected question's options too
    const questionSet = selected.map((q) => ({
      questionId: q.id,
      text: q.text,
      options: shuffleArray(
        q.options.map((opt) => ({ optionId: opt.id, text: opt.text }))
        // NOTE: deliberately NOT including isCorrect here —
        // this object gets sent to the frontend, so the correct answer
        // must never be exposed to the client.
      ),
    }));

    return questionSet;
  }

  async createSession(userId: string, assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const existingAttempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, assessmentId },
    });

    if (existingAttempts.length >= assessment.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    const activeSession = await this.prisma.examSession.findFirst({
      where: {
        userId,
        assessmentId,
        status: ExamStatus.ACTIVE,
      },
    });

    if (activeSession) {
      return activeSession;
    }

    const questionSet = await this.generateQuestionSet(assessmentId);

    return this.prisma.examSession.create({
      data: {
        userId,
        assessmentId,
        status: ExamStatus.ACTIVE,
        warningsCount: 0,
        scoreDeduction: 0,
        questionSet,
      },
    });
  }

  async getActiveSession(userId: string, assessmentId?: string) {
    const whereClause: Record<string, unknown> = {
      userId,
      status: ExamStatus.ACTIVE,
    };
    if (assessmentId) {
      whereClause.assessmentId = assessmentId;
    }
    return this.prisma.examSession.findFirst({
      where: whereClause as Prisma.ExamSessionWhereInput,
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        violations: true,
        assessment: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimit: true,
          },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Exam session not found');
    }

    return session; // session.questionSet has the locked, shuffled questions
  }

  async logViolation(userId: string, sessionId: string, type: ViolationType) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Exam session not found');
    }

    if (session.status !== ExamStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    // Create the Violation Log
    await this.prisma.violationLog.create({
      data: {
        sessionId,
        userId,
        type,
      },
    });

    const newWarningsCount = session.warningsCount + 1;
    let newStatus: ExamStatus = ExamStatus.ACTIVE;
    let newDeduction = session.scoreDeduction;
    let lockoutUntil: Date | null = null;

    if (newWarningsCount === 1) {
      // First warning: visual warning overlay + timer halt on client side
    } else if (newWarningsCount === 2) {
      // Second warning: 15% deduction + 30-second lockout
      newDeduction = 15;
      lockoutUntil = new Date(Date.now() + 30 * 1000);
    } else if (newWarningsCount >= 3) {
      // Third warning: terminate session immediately + zero grade
      newStatus = ExamStatus.TERMINATED;
    }

    const updatedSession = await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        warningsCount: newWarningsCount,
        status: newStatus,
        scoreDeduction: newDeduction,
        lockoutUntil,
        endedAt: newStatus === ExamStatus.TERMINATED ? new Date() : null,
      },
    });

    // If terminated, register a zero grade assessment attempt
    if (newStatus === ExamStatus.TERMINATED) {
      await this.prisma.assessmentAttempt.create({
        data: {
          userId,
          assessmentId: session.assessmentId,
          score: 0,
          passed: false,
          completedAt: new Date(),
        },
      });

      await this.auditService.logAction(
        userId,
        AuditAction.ASSESSMENT_PUBLISHED,
        `AttemptTerminated: sessionId=${sessionId}, userId=${userId}`,
      );
      await this.awardService.checkAndAward(userId, AchievementCategory.ASSESSMENT);
    }

    return updatedSession;
  }

  async submitSession(userId: string, sessionId: string, selectedAnswers: Record<string, string>) {
    const session = await this.getSession(userId, sessionId);

    if (session.status !== ExamStatus.ACTIVE) {
      throw new BadRequestException('Exam session is not active or already submitted.');
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: session.assessmentId },
    });

    const existingAttempts = await this.prisma.assessmentAttempt.count({
      where: {
        userId,
        assessmentId: session.assessmentId,
        completedAt: { not: null },
      },
    });

    if (assessment && existingAttempts >= assessment.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    // Use the LOCKED question set from session creation, not the live bank
    const lockedQuestions = session.questionSet as Array<{
      questionId: string;
      text: string;
      options: { optionId: string; text: string }[];
    }>;

    let score = 0;
    const totalQuestions = lockedQuestions.length;
    const attemptAnswersToCreate = [];

    for (const question of lockedQuestions) {
      const selectedOptionId = selectedAnswers[question.questionId] ?? null;

      if (!selectedOptionId) continue;

      // Look up the real option from the DB to check isCorrect
      // (isCorrect was deliberately stripped from questionSet so it's never sent to the client)
      const realOption = await this.prisma.questionOption.findUnique({
        where: { id: selectedOptionId },
      });

      const isCorrect = realOption?.isCorrect ?? false;

      if (isCorrect) {
        score += 1;
      }

      attemptAnswersToCreate.push({
        questionId: question.questionId,
        selectedOptionId,
        isCorrect,
      });
    }

    // Apply percentage-based score calculation
    let percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Apply proctoring violation deduction (15% deduction on second warning)
    percentage = Math.max(0, percentage - session.scoreDeduction);

    const passed = percentage >= session.assessment.passingScore;

    // Store correctCount (score) adjusted for proctoring deduction
    const finalScore = session.scoreDeduction > 0
      ? Math.max(0, Math.round((percentage / 100) * totalQuestions))
      : score;

    // Update session status to SUBMITTED
    await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: ExamStatus.SUBMITTED,
        endedAt: new Date(),
      },
    });

    // Create final assessment attempt
    const attempt = await this.prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId: session.assessmentId,
        score: finalScore,
        passed,
        completedAt: new Date(),
        attemptAnswers: {
          create: attemptAnswersToCreate,
        },
      },
    });

    // If there were violations, link them to the attempt too for historical record
    await this.prisma.violationLog.updateMany({
      where: { sessionId },
      data: { attemptId: attempt.id },
    });

    return {
      attemptId: attempt.id,
      score: finalScore,
      passed,
    };
  }

  // ─────────────────── FACULTY OWNERSHIP VALIDATION ───────────────────

  async validateAssessmentFacultyOwnership(
    assessmentId: string,
    userId: string,
  ): Promise<true> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        module: {
          include: {
            track: {
              include: {
                program: {
                  include: {
                    faculty: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const program = assessment.module.track.program;

    // Check if the faculty member owns this program
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!faculty) {
      throw new ForbiddenException('Faculty profile not found');
    }

    if (program.facultyId !== faculty.id && program.institutionId !== faculty.institutionId) {
      throw new ForbiddenException(
        'You do not have access to this assessment',
      );
    }

    return true;
  }

  // ─────────────────── RESULT ANALYTICS ───────────────────

  /**
   * Aggregates completed attempt data for faculty analytics:
   * total attempts, unique students, average score/percentage,
   * pass rate, and score distribution buckets.
   */
  async getResultAnalytics(
    assessmentId: string,
  ): Promise<ResultAnalyticsResponseDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        completedAt: { not: null },
      },
      select: {
        score: true,
        passed: true,
        userId: true,
      },
    });

    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return {
        assessmentId,
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        averagePercentage: 0,
        passRate: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        scoreDistribution: [
          { range: '0-20%', count: 0 },
          { range: '21-40%', count: 0 },
          { range: '41-60%', count: 0 },
          { range: '61-80%', count: 0 },
          { range: '81-100%', count: 0 },
        ],
      };
    }

    const uniqueStudents = new Set(attempts.map((a) => a.userId)).size;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const failedAttempts = totalAttempts - passedAttempts;
    const passRate = this.passFailEvaluationService.calculatePercentage(
      passedAttempts,
      totalAttempts,
    );

    const scores = attempts.map((a) =>
      a.score > assessment.sampleSize
        ? Math.round((a.score / 100) * assessment.sampleSize)
        : a.score
    );
    const scoreSum = scores.reduce((acc, s) => acc + s, 0);
    const averageScore = Math.round((scoreSum / totalAttempts) * 100) / 100;

    // Calculate percentages for each attempt
    const percentages = attempts.map((a) =>
      a.score > assessment.sampleSize
        ? a.score
        : this.passFailEvaluationService.calculatePercentage(
            a.score,
            assessment.sampleSize,
          ),
    );
    const percentageSum = percentages.reduce((acc, p) => acc + p, 0);
    const averagePercentage =
      Math.round((percentageSum / totalAttempts) * 100) / 100;

    // Score distribution buckets
    const buckets = [
      { range: '0-20%', min: 0, max: 20, count: 0 },
      { range: '21-40%', min: 21, max: 40, count: 0 },
      { range: '41-60%', min: 41, max: 60, count: 0 },
      { range: '61-80%', min: 61, max: 80, count: 0 },
      { range: '81-100%', min: 81, max: 100, count: 0 },
    ];

    for (const pct of percentages) {
      for (const bucket of buckets) {
        if (pct >= bucket.min && pct <= bucket.max) {
          bucket.count += 1;
          break;
        }
      }
    }

    return {
      assessmentId,
      totalAttempts,
      uniqueStudents,
      averageScore,
      averagePercentage,
      passRate,
      passedAttempts,
      failedAttempts,
      scoreDistribution: buckets.map((b) => ({
        range: b.range,
        count: b.count,
      })),
    };
  }

  // ─────────────────── MISSED QUESTIONS ANALYTICS ───────────────────

  /**
   * Aggregates per-question wrong-answer rates across all completed
   * attempts for a given assessment. Sorted by wrongRate DESC
   * (hardest questions first).
   */
  async getMissedQuestionsAnalytics(
    assessmentId: string,
  ): Promise<MissedQuestionsAnalyticsResponseDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questionBank: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                category: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    // Get all attempt answers for completed attempts of this assessment
    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          assessmentId,
          completedAt: { not: null },
        },
      },
      select: {
        questionId: true,
        isCorrect: true,
      },
    });

    // Aggregate per question
    const questionStatsMap = new Map<
      string,
      { totalAnswered: number; totalWrong: number }
    >();

    for (const ans of answers) {
      const stats = questionStatsMap.get(ans.questionId) ?? {
        totalAnswered: 0,
        totalWrong: 0,
      };
      stats.totalAnswered += 1;
      if (!ans.isCorrect) {
        stats.totalWrong += 1;
      }
      questionStatsMap.set(ans.questionId, stats);
    }

    // Build response, joining with question metadata
    const questionMap = new Map(
      assessment.questionBank.questions.map((q) => [q.id, q]),
    );

    const questions = Array.from(questionStatsMap.entries())
      .map(([questionId, stats]) => {
        const qMeta = questionMap.get(questionId);
        const wrongRate = this.passFailEvaluationService.calculatePercentage(
          stats.totalWrong,
          stats.totalAnswered,
        );

        return {
          questionId,
          questionText: qMeta?.text ?? 'Unknown question',
          category: qMeta?.category ?? null,
          difficulty: qMeta?.difficulty ?? null,
          totalAnswered: stats.totalAnswered,
          totalWrong: stats.totalWrong,
          wrongRate,
        };
      })
      .sort((a, b) => b.wrongRate - a.wrongRate);

    return {
      assessmentId,
      questions,
    };
  }
}
