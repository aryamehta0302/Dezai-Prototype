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
import { QuestionSelectionService } from './question-selection.service';
import {
  PassFailEvaluationService,
  AttemptAnswerWithRelations,
} from './pass-fail-evaluation.service';
import type {
  GetAttemptResultResponseDto,
  AttemptHistoryResponseDto,
  MyHistoryResponseDto,
  AttemptStatusResponseDto,
} from '../dto/result.dto';

/** Maximum number of attempts allowed per assessment per student. */
const MAX_ATTEMPTS_DEFAULT = 3;

@Injectable()
export class AttemptService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private xpService: XpService,
    private awardService: AwardService,
    private assessmentService: AssessmentService,
    private questionSelectionService: QuestionSelectionService,
    private passFailEvaluationService: PassFailEvaluationService,
  ) {}

  // ─────────────────── START ATTEMPT ───────────────────

  /**
   * Start a new attempt or return an active one if it already exists.
   * Enforces attempt limits (MAX_ATTEMPTS_DEFAULT = 3) and blocks if
   * an in-progress attempt already exists.
   */
  async startAttempt(userId: string, assessmentId: string) {
    // Sprint 5 Task 2: Enforce attempt limits before proceeding
    const existingAttempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, assessmentId },
    });

    const active = existingAttempts.find((a) => !a.completedAt);
    if (active) {
      throw new ConflictException(
        'An active attempt already exists. Resume it.',
      );
    }

    if (existingAttempts.length >= MAX_ATTEMPTS_DEFAULT) {
      throw new ForbiddenException(
        'Maximum attempts reached for this assessment.',
      );
    }

    // 1. Create or get the active proctoring session using AssessmentService
    const session = await this.assessmentService.createSession(
      userId,
      assessmentId,
    );

    // 2. Create a new in-progress attempt
    const attempt = await this.prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId,
        score: 0,
        passed: false,
      },
    });

    // 3. Select randomized questions using attempt.id as a persistent seed
    const selection = await this.questionSelectionService.selectQuestions(
      assessmentId,
      attempt.id,
    );

    return {
      success: true,
      attemptId: attempt.id,
      sessionId: session.id,
      startedAt: attempt.startedAt,
      warningsCount: session.warningsCount,
      scoreDeduction: session.scoreDeduction,
      lockoutUntil: session.lockoutUntil,
      status: session.status,
      ...selection,
    };
  }

  // ─────────────────── RESUME ATTEMPT ───────────────────

  /**
   * Resume an in-progress attempt.
   */
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

    // Find the corresponding active proctoring session
    const session = await this.prisma.examSession.findFirst({
      where: {
        userId,
        assessmentId: attempt.assessmentId,
        status: ExamStatus.ACTIVE,
      },
    });

    if (!session) {
      throw new NotFoundException(
        'No active proctoring session found for this attempt',
      );
    }

    // Regenerate identical questions using the same seed (attempt.id)
    const selection = await this.questionSelectionService.selectQuestions(
      attempt.assessmentId,
      attempt.id,
    );

    // Get currently saved answers
    const savedAnswers = await this.prisma.attemptAnswer.findMany({
      where: { attemptId },
      select: { questionId: true, selectedOptionId: true },
    });

    const answersRecord: Record<string, string> = {};
    for (const ans of savedAnswers) {
      answersRecord[ans.questionId] = ans.selectedOptionId;
    }

    // Recalculate remaining time (30 minutes default duration)
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000,
    );
    const durationSeconds = 1800; // 30 minutes
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
    };
  }

  // ─────────────────── AUTO-SAVE ANSWERS ───────────────────

  /**
   * Save student's current answers. Programmatically upsert answers
   * to avoid creating duplicate rows since AttemptAnswer lacks a unique constraint.
   */
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

    // Process answers sequentially to update or create
    for (const [questionId, selectedOptionId] of Object.entries(answers)) {
      const dbQuestion = questions.find((q) => q.id === questionId);
      if (!dbQuestion) continue;

      const correctOption = dbQuestion.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      const existingAnswer = await this.prisma.attemptAnswer.findFirst({
        where: {
          attemptId,
          questionId,
        },
      });

      if (existingAnswer) {
        await this.prisma.attemptAnswer.update({
          where: { id: existingAnswer.id },
          data: {
            selectedOptionId,
            isCorrect,
            answeredAt: new Date(),
          },
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

    return { success: true };
  }

  // ─────────────────── SUBMIT ATTEMPT ───────────────────

  /**
   * Submit and grade the attempt. Applies proctoring deductions, awards XP
   * on first pass, fires audit logs, and checks credential eligibility.
   */
  async submitAttempt(userId: string, attemptId: string) {
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

    // Retrieve corresponding active proctoring session
    const session = await this.prisma.examSession.findFirst({
      where: {
        userId,
        assessmentId: attempt.assessmentId,
        status: ExamStatus.ACTIVE,
      },
    });

    // Re-verify the selected question set to calculate correct percentage
    const selection = await this.questionSelectionService.selectQuestions(
      attempt.assessmentId,
      attempt.id,
    );

    const selectedQuestionIds = selection.questions.map((q) => q.id);

    // Fetch the updated attempt answers
    const finalAnswers = await this.prisma.attemptAnswer.findMany({
      where: { attemptId },
    });

    let correctCount = 0;
    for (const questionId of selectedQuestionIds) {
      const ans = finalAnswers.find((a) => a.questionId === questionId);
      if (ans && ans.isCorrect) {
        correctCount += 1;
      }
    }

    const totalQuestions = selectedQuestionIds.length;
    let percentage = this.passFailEvaluationService.calculatePercentage(
      correctCount,
      totalQuestions,
    );

    // Apply proctoring violation deduction if applicable
    if (session && session.scoreDeduction > 0) {
      percentage = Math.max(0, percentage - session.scoreDeduction);
    }

    const passed = percentage >= attempt.assessment.passingScore;

    // Update session status to SUBMITTED
    if (session) {
      await this.prisma.examSession.update({
        where: { id: session.id },
        data: {
          status: ExamStatus.SUBMITTED,
          endedAt: new Date(),
        },
      });

      // Link violation logs to the attempt for historical record
      await this.prisma.violationLog.updateMany({
        where: { sessionId: session.id },
        data: { attemptId: attempt.id },
      });
    }

    // Update final assessment attempt grade
    const updatedAttempt = await this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        score: percentage,
        passed,
        completedAt: new Date(),
      },
    });

    // Award XP on first pass only
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

    // Sprint 5 Task 4: Audit log on attempt completion
    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `AttemptCompleted: attemptId=${attemptId}, score=${percentage}, passed=${passed}`,
    );

    // Sprint 5 Task 5: Check credential eligibility if student passed
    if (passed) {
      await this.checkCredentialEligibility(userId, attempt.assessment.moduleId);
    }

    // Check and award ASSESSMENT achievements
    await this.awardService.checkAndAward(userId, AchievementCategory.ASSESSMENT);

    return {
      success: true,
      attemptId: updatedAttempt.id,
      score: percentage,
      passed,
    };
  }

  // ─────────────────── CREDENTIAL ELIGIBILITY (Task 5) ───────────────────

  /**
   * After a student passes an assessment, check if they've completed
   * all assessments in the track. If so, fire a notification to signal
   * credential eligibility to Tirth's credential service.
   *
   * Traversal: Assessment.moduleId → Module.trackId → ProgramTrack → all Modules → all Assessments
   */
  private async checkCredentialEligibility(
    userId: string,
    moduleId: string,
  ): Promise<void> {
    // 1. Resolve the full chain: Module → Track → Program
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

    // 2. Check if this is the last module in the track
    const maxOrder = Math.max(...allModules.map((m) => m.order));
    if (currentModule.order !== maxOrder) return;

    // 3. Check if student has passed assessments in ALL modules of the track
    for (const mod of allModules) {
      if (mod.assessments.length === 0) continue; // Skip modules with no assessments

      const passedAssessment = await this.prisma.assessmentAttempt.findFirst({
        where: {
          userId,
          assessmentId: { in: mod.assessments.map((a) => a.id) },
          passed: true,
          completedAt: { not: null },
        },
      });

      if (!passedAssessment) return; // Student hasn't passed this module's assessment
    }

    // 4. All modules passed — fire credential eligibility notification
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

    // 5. Fire audit log for credential eligibility
    await this.auditService.logAction(
      userId,
      AuditAction.CREDENTIAL_ISSUED,
      `CredentialEligibility: userId=${userId}, programId=${programId}, trackId=${trackId}`,
    );
  }

  // ─────────────────── GET ATTEMPT RESULT (Task 1) ───────────────────

  /**
   * Get completed attempt result with per-question breakdown.
   * Students can only fetch their own results.
   * Faculty can fetch any student's result for assessments they own.
   */
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
          include: {
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    // Ownership check: student can only see their own, faculty via ownership
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

    // Reconstruct selected questions in identical order using the seed (attempt.id)
    const selection = await this.questionSelectionService.selectQuestions(
      attempt.assessmentId,
      attempt.id,
    );

    const totalQuestions = attempt.assessment.sampleSize;
    const timeTaken = Math.floor(
      (new Date(attempt.completedAt).getTime() -
        new Date(attempt.startedAt).getTime()) /
        1000,
    );

    const correctCount = attempt.attemptAnswers.filter((a) => a.isCorrect).length;
    const percentage = this.passFailEvaluationService.calculatePercentage(
      correctCount,
      totalQuestions,
    );

    const questions = selection.questions.map((q) => {
      const savedAns = attempt.attemptAnswers.find(
        (a) => a.questionId === q.id,
      );
      const dbQuestion = attempt.assessment.questionBank.questions.find(
        (dbQ) => dbQ.id === q.id,
      );
      const correctOption = dbQuestion?.options.find((o) => o.isCorrect);

      return {
        questionId: q.id,
        questionText: q.text,
        selectedOptionId: savedAns?.selectedOptionId ?? null,
        selectedOptionText: savedAns?.selectedOption?.text ?? null,
        isCorrect: savedAns ? savedAns.isCorrect : false,
        correctOptionId: correctOption?.id ?? '',
        correctOptionText: correctOption?.text ?? '',
        options: (dbQuestion?.options ?? []).map((o) => ({
          id: o.id,
          text: o.text,
        })),
      };
    });

    return {
      attemptId: attempt.id,
      assessmentTitle: attempt.assessment.title,
      score: correctCount,
      percentage,
      passed: attempt.passed,
      passingScore: attempt.assessment.passingScore,
      totalQuestions,
      timeTaken,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      questions,
    };
  }

  // ─────────────────── ATTEMPT HISTORY (Task 1) ───────────────────

  /**
   * Return attempt history for an assessment.
   * Students see only their own history; faculty see all students' history.
   */
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

    // Faculty ownership validation is handled by the controller
    const whereClause: any = {
      assessmentId,
      completedAt: { not: null },
    };

    // Students can only see their own history
    if (!userRole || userRole === UserRole.STUDENT) {
      whereClause.userId = userId;
    }

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: whereClause,
      orderBy: { startedAt: 'desc' },
    });

    const attemptDtos = attempts.map((a) => ({
      attemptId: a.id,
      score: a.score,
      percentage: this.passFailEvaluationService.calculatePercentage(
        a.score,
        assessment.sampleSize,
      ),
      passed: a.passed,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
    }));

    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      totalAttempts: attemptDtos.length,
      attempts: attemptDtos,
    };
  }

  // ─────────────────── MY HISTORY (Task 1) ───────────────────

  /**
   * Returns all attempts across all assessments for the current student.
   */
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

    const attemptDtos = attempts.map((a) => ({
      attemptId: a.id,
      assessmentId: a.assessmentId,
      assessmentTitle: a.assessment.title,
      moduleTitle: a.assessment.module.title,
      score: a.score,
      percentage: this.passFailEvaluationService.calculatePercentage(
        a.score,
        a.assessment.sampleSize,
      ),
      passed: a.passed,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
    }));

    return {
      userId,
      attempts: attemptDtos,
    };
  }

  // ─────────────────── ATTEMPT STATUS (Task 2) ───────────────────

  /**
   * Returns attempt status with remaining attempts, active attempt info,
   * and best score for a student on a given assessment.
   */
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
    const attemptsUsed = attempts.length;
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS_DEFAULT - attemptsUsed);

    // Best score among completed attempts
    let bestScore: number | null = null;
    let bestPercentage: number | null = null;
    let everPassed = false;

    if (completedAttempts.length > 0) {
      bestScore = Math.max(...completedAttempts.map((a) => a.score));
      bestPercentage = this.passFailEvaluationService.calculatePercentage(
        bestScore,
        assessment.sampleSize,
      );
      everPassed = completedAttempts.some((a) => a.passed);
    }

    return {
      assessmentId,
      attemptsUsed,
      attemptsRemaining,
      maxAttempts: MAX_ATTEMPTS_DEFAULT,
      hasActiveAttempt: !!activeAttempt,
      activeAttemptId: activeAttempt?.id ?? null,
      canAttempt: !activeAttempt && attemptsRemaining > 0,
      bestScore,
      bestPercentage,
      everPassed,
    };
  }
}
