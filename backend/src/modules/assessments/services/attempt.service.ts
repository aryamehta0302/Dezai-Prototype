import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import {
  AuditAction,
  ExamStatus,
  XpType,
} from "@prisma/client";
import { AuditService } from "../../audit/services/audit.service";
import { XpService } from "../../users/services/xp.service";
import { AssessmentService } from "./assessment.service";
import { QuestionSelectionService } from "./question-selection.service";

@Injectable()
export class AttemptService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private xpService: XpService,
    private assessmentService: AssessmentService,
    private questionSelectionService: QuestionSelectionService
  ) {}

  /**
   * Start a new attempt or return an active one if it already exists.
   */
  async startAttempt(userId: string, assessmentId: string) {
    // 1. Create or get the active proctoring session using AssessmentService
    const session = await this.assessmentService.createSession(userId, assessmentId);

    // 2. Find or create the active in-progress attempt (completedAt is null)
    let attempt = await this.prisma.assessmentAttempt.findFirst({
      where: {
        userId,
        assessmentId,
        completedAt: null,
      },
    });

    if (!attempt) {
      attempt = await this.prisma.assessmentAttempt.create({
        data: {
          userId,
          assessmentId,
          score: 0,
          passed: false,
        },
      });
    }

    // 3. Select randomized questions using attempt.id as a persistent seed
    const selection = await this.questionSelectionService.selectQuestions(
      assessmentId,
      attempt.id
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

  /**
   * Resume an in-progress attempt.
   */
  async resumeAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: true },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException("Attempt not found");
    }

    if (attempt.completedAt) {
      throw new BadRequestException("Attempt is already completed");
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
      throw new NotFoundException("No active proctoring session found for this attempt");
    }

    // Regenerate identical questions using the same seed (attempt.id)
    const selection = await this.questionSelectionService.selectQuestions(
      attempt.assessmentId,
      attempt.id
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
      (Date.now() - new Date(session.startedAt).getTime()) / 1000
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

  /**
   * Save student's current answers. Programmatically upsert answers
   * to avoid creating duplicate rows since AttemptAnswer lacks a unique constraint.
   */
  async autoSaveAnswers(
    userId: string,
    attemptId: string,
    answers: Record<string, string>
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
      throw new NotFoundException("Attempt not found");
    }

    if (attempt.completedAt) {
      throw new BadRequestException("Attempt is already completed");
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

  /**
   * Submit and grade the attempt. Applies proctoring deductions and awards XP on first pass.
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
      throw new NotFoundException("Attempt not found");
    }

    if (attempt.completedAt) {
      throw new BadRequestException("Attempt is already completed");
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
      attempt.id
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
    let percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

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

    await this.auditService.logAction(
      userId,
      AuditAction.ASSESSMENT_PUBLISHED,
      `Assessment attempt "${attempt.assessment.title}" submitted. Score: ${percentage}%, Passed: ${passed}`
    );

    return {
      success: true,
      attemptId: updatedAttempt.id,
      score: percentage,
      passed,
    };
  }

  /**
   * Get completed attempt result with question breakdown and explanations.
   */
  async getAttemptResult(userId: string, attemptId: string) {
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

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException("Attempt not found");
    }

    if (!attempt.completedAt) {
      throw new BadRequestException("Attempt is not completed yet");
    }

    // Reconstruct selected questions in identical order using the seed (attempt.id)
    const selection = await this.questionSelectionService.selectQuestions(
      attempt.assessmentId,
      attempt.id
    );

    const breakdown = selection.questions.map((q) => {
      const savedAns = attempt.attemptAnswers.find((a) => a.questionId === q.id);
      const dbQuestion = attempt.assessment.questionBank.questions.find(
        (dbQ) => dbQ.id === q.id
      );
      const correctOption = dbQuestion?.options.find((o) => o.isCorrect);

      return {
        questionId: q.id,
        text: q.text,
        category: q.category,
        options: q.options,
        selectedOptionId: savedAns?.selectedOptionId || null,
        selectedOptionText: savedAns?.selectedOption?.text || null,
        correctOptionId: correctOption?.id || null,
        correctOptionText: correctOption?.text || null,
        isCorrect: savedAns ? savedAns.isCorrect : false,
        explanation: dbQuestion?.category
          ? `Concept category: ${dbQuestion.category}. Review this topic to master the question context.`
          : "Standard assessment answer explanation.",
      };
    });

    return {
      success: true,
      attemptId: attempt.id,
      assessmentTitle: attempt.assessment.title,
      score: attempt.score,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      breakdown,
    };
  }

  /**
   * Return attempt history for an assessment.
   */
  async getAttemptHistory(userId: string, assessmentId: string) {
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        userId,
        assessmentId,
        completedAt: { not: null },
      },
      orderBy: { startedAt: "desc" },
    });

    return {
      success: true,
      attempts,
    };
  }
}
