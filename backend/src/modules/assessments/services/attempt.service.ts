import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  AchievementCategory,
  AuditAction,
  ExamStatus,
  NotificationType,
  UserRole,
  XpType,
} from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { XpService } from '../../users/services/xp.service';
import { AwardService } from '../../achievements/services/award.service';
import { AssessmentService } from './assessment.service';
import {
  PassFailEvaluationService,
  AttemptAnswerWithRelations,
} from './pass-fail-evaluation.service';
import { InsightsSseService } from '../../analytics/services/insights-sse.service';
import type {
  GetAttemptResultResponseDto,
  AttemptHistoryResponseDto,
  MyHistoryResponseDto,
  AttemptStatusResponseDto,
} from '../dto/result.dto';

interface QuestionSetItem {
  questionId: string;
  text: string;
  options: { optionId: string; text: string }[];
}

@Injectable()
export class AttemptService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private xpService: XpService,
    private awardService: AwardService,
    private assessmentService: AssessmentService,
    private passFailEvaluationService: PassFailEvaluationService,
    private insightsSseService: InsightsSseService,
  ) { }

  async startAttempt(userId: string, assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const existingAttempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, assessmentId },
    });

    const active = existingAttempts.find((a) => !a.completedAt);
    if (active) {
      if (assessment.allowResume) {
        throw new ConflictException('An active attempt already exists. Resume it.');
      }
      // Stale attempt with allowResume=false — delete it entirely so it doesn't count against maxAttempts
      await this.prisma.attemptAnswer.deleteMany({ where: { attemptId: active.id } });
      await this.prisma.violationLog.deleteMany({ where: { attemptId: active.id } });
      await this.prisma.assessmentAttempt.delete({ where: { id: active.id } });
    }

    const completedCount = await this.prisma.assessmentAttempt.count({
      where: { userId, assessmentId, completedAt: { not: null } },
    });
    if (completedCount >= assessment.maxAttempts) {
      throw new ForbiddenException('Maximum attempts reached for this assessment.');
    }

    const session = await this.assessmentService.createSession(userId, assessmentId);

    const attempt = await this.prisma.assessmentAttempt.create({
      data: { userId, assessmentId, score: 0, passed: false },
    });

    // Use the SAME questionSet from the session — NOT a fresh selectQuestions call,
    // which would independently shuffle and potentially return different questions.
    const questionSet = (session.questionSet ?? []) as unknown as QuestionSetItem[];
    const questions = questionSet.map(q => ({
      id: q.questionId,
      text: q.text,
      options: (q.options ?? []).map(o => ({ id: o.optionId, text: o.text })),
    }));

    return {
      success: true,
      attemptId: attempt.id,
      sessionId: session.id,
      startedAt: attempt.startedAt,
      warningsCount: session.warningsCount,
      scoreDeduction: session.scoreDeduction,
      lockoutUntil: session.lockoutUntil,
      status: session.status,
      assessmentId: attempt.assessmentId,
      assessmentTitle: assessment.title,
      passingScore: assessment.passingScore,
      timeLimit: assessment.timeLimit,
      sampleSize: assessment.sampleSize,
      totalAvailable: questionSet.length,
      questions,
      maxAttempts: assessment.maxAttempts,
      timeLimitEnabled: assessment.timeLimitEnabled,
      allowResume: assessment.allowResume,
    };
  }

  async resumeAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: true },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Attempt is already completed');
    }

    let session = await this.prisma.examSession.findFirst({
      where: { userId, assessmentId: attempt.assessmentId, status: ExamStatus.ACTIVE },
    });

    if (!session) {
      const questionSet = await this.assessmentService.generateQuestionSet(attempt.assessmentId);
      session = await this.prisma.examSession.create({
        data: {
          userId,
          assessmentId: attempt.assessmentId,
          status: ExamStatus.ACTIVE,
          warningsCount: 0,
          scoreDeduction: 0,
          questionSet,
        },
      });
    }

    if (!attempt.assessment.allowResume) {
      throw new ForbiddenException('Resuming is not allowed for this assessment.');
    }

    const questionSet = (session.questionSet ?? []) as unknown as QuestionSetItem[];
    const selection = {
      assessmentId: attempt.assessmentId,
      assessmentTitle: attempt.assessment.title,
      passingScore: attempt.assessment.passingScore,
      timeLimit: attempt.assessment.timeLimit,
      sampleSize: questionSet.length,
      totalAvailable: questionSet.length,
      questions: questionSet.map((q) => ({
        id: q.questionId,
        text: q.text,
        options: q.options.map((o) => ({ id: o.optionId, text: o.text })),
      })),
    };

    const savedAnswers = await this.prisma.attemptAnswer.findMany({
      where: { attemptId },
      select: { questionId: true, selectedOptionId: true },
    });

    const answersRecord: Record<string, string> = Object.fromEntries(
      savedAnswers.map((a) => [a.questionId, a.selectedOptionId]),
    );

    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000,
    );
    const durationSeconds = attempt.assessment.timeLimit;
    const remainingTime = Math.max(0, durationSeconds - elapsedSeconds);

    return {
      success: true,
      attemptId: attempt.id,
      sessionId: session.id,
      startedAt: attempt.startedAt,
      warningsCount: session.warningsCount,
      scoreDeduction: session.scoreDeduction,
      lockoutUntil: session.lockoutUntil,
      status: session.status,
      remainingTime,
      answers: answersRecord,
      ...selection,
      maxAttempts: attempt.assessment.maxAttempts,
      timeLimitEnabled: attempt.assessment.timeLimitEnabled,
      allowResume: attempt.assessment.allowResume,
    };
  }

  async autoSaveAnswers(
    userId: string,
    attemptId: string,
    answers: Record<string, string>,
  ) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questionBank: {
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Attempt is already completed');
    }

    const questions = attempt.assessment.questionBank.questions;

    for (const [questionId, selectedOptionId] of Object.entries(answers)) {
      const dbQuestion = questions.find((q) => q.id === questionId);
      if (!dbQuestion) continue;

      const correctOption = dbQuestion.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      const existingAnswer = await this.prisma.attemptAnswer.findFirst({
        where: { attemptId, questionId },
      });

      if (existingAnswer) {
        await this.prisma.attemptAnswer.update({
          where: { id: existingAnswer.id },
          data: { selectedOptionId, isCorrect, answeredAt: new Date() },
        });
      } else {
        await this.prisma.attemptAnswer.create({
          data: { attemptId, questionId, selectedOptionId, isCorrect, answeredAt: new Date() },
        });
      }
    }

    return { success: true };
  }

  async submitAttempt(
    userId: string,
    attemptId: string,
    answers?: Record<string, string>,
  ) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questionBank: {
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
        },
        attemptAnswers: true,
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Attempt is already completed');
    }

    // If answers provided, upsert them before grading
    if (answers) {
      for (const [questionId, selectedOptionId] of Object.entries(answers)) {
        const question = attempt.assessment.questionBank.questions.find(
          (q) => q.id === questionId,
        );
        if (!question) continue;
        const correctOption = question.options.find((o) => o.isCorrect);
        const isCorrect = selectedOptionId === correctOption?.id;
        const existing = attempt.attemptAnswers.find(
          (a) => a.questionId === questionId,
        );
        if (existing) {
          await this.prisma.attemptAnswer.update({
            where: { id: existing.id },
            data: { selectedOptionId, isCorrect, answeredAt: new Date() },
          });
        } else {
          await this.prisma.attemptAnswer.create({
            data: {
              attemptId,
              questionId,
              selectedOptionId,
              isCorrect,
              answeredAt: new Date(),
            },
          });
        }
      }
    }

    const session = await this.prisma.examSession.findFirst({
      where: { userId, assessmentId: attempt.assessmentId, status: ExamStatus.ACTIVE },
    });

    const questionSet = (session?.questionSet ?? []) as unknown as QuestionSetItem[];
    const hasQuestionSet = questionSet.length > 0;

    const finalAnswers = await this.prisma.attemptAnswer.findMany({
      where: { attemptId },
    });

    const selectedQuestionIds = hasQuestionSet
      ? questionSet.map((q) => q.questionId)
      : finalAnswers.map((a) => a.questionId);

    let correctCount = 0;
    for (const questionId of selectedQuestionIds) {
      const ans = finalAnswers.find((a) => a.questionId === questionId);
      if (ans && ans.isCorrect) {
        correctCount += 1;
      }
    }

    const totalQuestions = hasQuestionSet
      ? questionSet.length
      : Math.max(finalAnswers.length, attempt.assessment.sampleSize);
    let percentage = this.passFailEvaluationService.calculatePercentage(
      correctCount,
      totalQuestions,
    );

    if (session && session.scoreDeduction > 0) {
      percentage = Math.max(0, percentage - session.scoreDeduction);
    }

    const passed = percentage >= attempt.assessment.passingScore;

    const finalScore =
      session && session.scoreDeduction > 0
        ? Math.max(0, Math.round((percentage / 100) * totalQuestions))
        : correctCount;

    if (session) {
      await this.prisma.examSession.update({
        where: { id: session.id },
        data: { status: ExamStatus.SUBMITTED, endedAt: new Date() },
      });

      await this.prisma.violationLog.updateMany({
        where: { sessionId: session.id },
        data: { attemptId: attempt.id },
      });
    }

    const updatedAttempt = await this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { score: finalScore, passed, completedAt: new Date() },
    });

    if (passed) {
      const priorPass = await this.prisma.assessmentAttempt.findFirst({
        where: {
          userId,
          assessmentId: attempt.assessmentId,
          passed: true,
          completedAt: { not: null },
          id: { not: attemptId },
        },
      });

      if (!priorPass) {
        await this.xpService.awardXp(userId, XpType.ASSESSMENT_PASS);
      }
    }

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `AttemptCompleted: attemptId=${attemptId}, score=${finalScore}, passed=${passed}`,
    );

    if (passed) {
      await this.checkCredentialEligibility(userId, attempt.assessment.moduleId);
    }

    await this.awardService.checkAndAward(userId, AchievementCategory.ASSESSMENT);

    // Notify faculty in real-time about student activity
    this.insightsSseService.notifyFacultyOfStudentUpdate(userId, 'HEALTH_UPDATE', {
      userId,
      assessmentId: attempt.assessmentId,
      passed,
      score: percentage,
    });

    return {
      success: true,
      attemptId: updatedAttempt.id,
      score: finalScore,
      passed,
    };
  }

  private async checkCredentialEligibility(
    userId: string,
    moduleId: string,
  ): Promise<void> {
    const currentModule = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        track: {
          include: {
            program: true,
            modules: {
              orderBy: { order: 'asc' },
              include: {
                assessments: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    if (!currentModule || !currentModule.track) return;

    const track = currentModule.track;
    const allModules = track.modules;

    const maxOrder = Math.max(...allModules.map((m) => m.order));
    if (currentModule.order !== maxOrder) return;

    for (const mod of allModules) {
      if (mod.assessments.length === 0) continue;

      const passedAssessment = await this.prisma.assessmentAttempt.findFirst({
        where: {
          userId,
          assessmentId: { in: mod.assessments.map((a) => a.id) },
          passed: true,
          completedAt: { not: null },
        },
      });

      if (!passedAssessment) return;
    }

    const programId = track.program.id;
    const trackId = track.id;

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'You are eligible for a credential!',
        message:
          'You have passed all assessments in the track. Your credential is being processed.',
        type: NotificationType.CREDENTIAL,
        read: false,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.CREDENTIAL_ISSUED,
      `CredentialEligibility: userId=${userId}, programId=${programId}, trackId=${trackId}`,
    );
  }

  async getAttemptResult(
    userId: string,
    attemptId: string,
    userRole?: UserRole,
  ): Promise<GetAttemptResultResponseDto> {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questionBank: {
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
        },
        attemptAnswers: {
          include: { selectedOption: true },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (userRole === UserRole.FACULTY) {
      await this.assessmentService.validateAssessmentFacultyOwnership(
        attempt.assessmentId,
        userId,
      );
    } else if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only view your own attempt results');
    }

    if (!attempt.completedAt) {
      throw new BadRequestException('Attempt is not completed yet');
    }

    const session = await this.prisma.examSession.findFirst({
      where: {
        userId,
        assessmentId: attempt.assessmentId,
        status: { in: [ExamStatus.SUBMITTED, ExamStatus.TERMINATED] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const questionSet = (session?.questionSet ?? []) as unknown as QuestionSetItem[];
    const totalQuestions = questionSet.length > 0
      ? questionSet.length
      : Math.max(attempt.attemptAnswers.length, attempt.assessment.sampleSize);
    const timeTaken = Math.floor(
      (new Date(attempt.completedAt).getTime() -
        new Date(attempt.startedAt).getTime()) /
      1000,
    );

    const questions = (questionSet.length > 0 ? questionSet.map((q) => ({
        questionId: q.questionId,
        questionText: q.text,
      })) : attempt.attemptAnswers.map((a) => ({
        questionId: a.questionId,
        questionText: null as string | null,
      }))).map((meta) => {
        const savedAns = attempt.attemptAnswers.find((a) => a.questionId === meta.questionId);
        const dbQuestion = attempt.assessment.questionBank.questions.find(
          (dbQ) => dbQ.id === meta.questionId,
        );
        const correctOption = dbQuestion?.options.find((o) => o.isCorrect);
        const isCorrect = savedAns ? savedAns.selectedOptionId === correctOption?.id : false;

        return {
          questionId: meta.questionId,
          questionText: meta.questionText ?? dbQuestion?.text ?? 'Unknown question',
          selectedOptionId: savedAns?.selectedOptionId ?? null,
          selectedOptionText: savedAns?.selectedOption?.text ?? null,
          isCorrect,
          correctOptionId: correctOption?.id ?? '',
          correctOptionText: correctOption?.text ?? '',
          options: (dbQuestion?.options ?? []).map((o) => ({
            id: o.id,
            text: o.text,
          })),
        };
      });

    const score = questions.filter((q) => q.isCorrect).length;
    const rawPercentage = Math.round((score / totalQuestions) * 100);
    const deduction = session?.scoreDeduction ?? 0;
    const effectivePercentage = Math.max(0, rawPercentage - deduction);
    const effectiveScore = deduction > 0
      ? Math.max(0, Math.round((effectivePercentage / 100) * totalQuestions))
      : score;

    return {
      attemptId: attempt.id,
      assessmentTitle: attempt.assessment.title,
      score: effectiveScore,
      percentage: effectivePercentage,
      passed: effectivePercentage >= attempt.assessment.passingScore,
      passingScore: attempt.assessment.passingScore,
      totalQuestions,
      timeTaken,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      questions,
    };
  }

  async getAttemptHistory(
    assessmentId: string,
    userId: string,
    userRole?: UserRole,
  ): Promise<AttemptHistoryResponseDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { id: true, title: true, sampleSize: true },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const where: Record<string, unknown> = {
      assessmentId,
      completedAt: { not: null },
    };

    if (!userRole || userRole === UserRole.STUDENT) {
      where.userId = userId;
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where,
      orderBy: { startedAt: 'desc' },
    });

    const attemptDtos = attempts.map((a) => {
      const percentage =
        a.score > assessment.sampleSize
          ? a.score
          : this.passFailEvaluationService.calculatePercentage(
              a.score,
              assessment.sampleSize,
            );
      return {
        attemptId: a.id,
        score: a.score,
        percentage,
        passed: a.passed,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
      };
    });

    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      totalAttempts: attemptDtos.length,
      attempts: attemptDtos,
    };
  }

  async getMyHistory(userId: string): Promise<MyHistoryResponseDto> {
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId },
      include: {
        assessment: {
          include: {
            module: { select: { title: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const attemptDtos = attempts.map((a) => {
      const percentage =
        a.score > a.assessment.sampleSize
          ? a.score
          : this.passFailEvaluationService.calculatePercentage(
              a.score,
              a.assessment.sampleSize,
            );
      return {
        attemptId: a.id,
        assessmentId: a.assessmentId,
        assessmentTitle: a.assessment.title,
        moduleTitle: a.assessment.module.title,
        score: a.score,
        percentage,
        passed: a.passed,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
      };
    });

    return { userId, attempts: attemptDtos };
  }

  async getAttemptStatus(
    assessmentId: string,
    userId: string,
  ): Promise<AttemptStatusResponseDto> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, assessmentId },
    });

    const activeAttempt = attempts.find((a) => !a.completedAt);
    const completedAttempts = attempts.filter((a) => a.completedAt !== null);
    const attemptsUsed = completedAttempts.length;
    const attemptsRemaining = Math.max(0, assessment.maxAttempts - attemptsUsed);

    let bestScore: number | null = null;
    let bestPercentage: number | null = null;
    let everPassed = false;

    if (completedAttempts.length > 0) {
      bestScore = Math.max(...completedAttempts.map((a) => a.score));
      bestPercentage =
        bestScore > assessment.sampleSize
          ? bestScore
          : this.passFailEvaluationService.calculatePercentage(
              bestScore,
              assessment.sampleSize,
            );
      everPassed = completedAttempts.some((a) => a.passed);
    }

    return {
      assessmentId,
      attemptsUsed,
      attemptsRemaining,
      maxAttempts: assessment.maxAttempts,
      hasActiveAttempt: !!activeAttempt,
      activeAttemptId: activeAttempt?.id ?? null,
      canAttempt: !activeAttempt && attemptsRemaining > 0 && !everPassed,
      bestScore,
      bestPercentage,
      everPassed,
    };
  }
}
