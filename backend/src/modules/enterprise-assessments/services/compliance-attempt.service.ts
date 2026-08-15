import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditAction } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { PassFailEvaluationService } from '../../assessments/services/pass-fail-evaluation.service';
import { ComplianceAssessmentService } from './compliance-assessment.service';

@Injectable()
export class ComplianceAttemptService {
  private readonly logger = new Logger(ComplianceAttemptService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private passFailEvaluationService: PassFailEvaluationService,
    private complianceAssessmentService: ComplianceAssessmentService,
  ) {}

  // ─────────────────── START ATTEMPT ───────────────────

  async startAttempt(userId: string, assessmentId: string) {
    const assessment = await this.prisma.complianceAssessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new NotFoundException('Compliance assessment not found');
    }

    // Resolve employee record
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    if (!employee) {
      throw new ForbiddenException('Employee profile not found — you must be an employee to take compliance assessments');
    }
    if (employee.organizationId !== assessment.organizationId) {
      throw new ForbiddenException('You do not belong to this assessment\'s organization');
    }

    // Check for existing active (in-progress) attempt
    const activeAttempt = await this.prisma.complianceAssessmentAttempt.findFirst({
      where: { userId, assessmentId, completedAt: null },
    });
    if (activeAttempt) {
      if (assessment.allowResume) {
        throw new BadRequestException('An active attempt already exists. Resume it.');
      }
      // Clean up stale attempt
      await this.prisma.complianceAttemptAnswer.deleteMany({ where: { attemptId: activeAttempt.id } });
      await this.prisma.complianceAssessmentAttempt.delete({ where: { id: activeAttempt.id } });
    }

    // Check max attempts
    const completedCount = await this.prisma.complianceAssessmentAttempt.count({
      where: { userId, assessmentId, completedAt: { not: null } },
    });
    if (completedCount >= assessment.maxAttempts) {
      throw new ForbiddenException('Maximum attempts reached for this compliance assessment.');
    }

    // Create attempt
    const attempt = await this.prisma.complianceAssessmentAttempt.create({
      data: {
        userId,
        employeeId: employee.id,
        assessmentId,
        score: 0,
        percentage: 0,
        passed: false,
      },
    });

    // Select questions using the compliance assessment service
    const selection = await this.complianceAssessmentService.selectEnterpriseQuestions(assessmentId);

    return {
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      ...selection,
      maxAttempts: assessment.maxAttempts,
      timeLimitEnabled: assessment.timeLimitEnabled,
      allowResume: assessment.allowResume,
    };
  }

  // ─────────────────── SUBMIT ATTEMPT ───────────────────

  /**
   * Grades and finalises a compliance attempt.
   * Stores BOTH score (raw count) AND percentage on the attempt — never derive later.
   * Reuses PassFailEvaluationService.calculatePercentage() — no duplicate logic.
   */
  async submitAttempt(
    userId: string,
    attemptId: string,
    answers: Record<string, string>,
  ) {
    const attempt = await this.prisma.complianceAssessmentAttempt.findUnique({
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
      throw new NotFoundException('Compliance attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Attempt is already completed');
    }

    const questions = attempt.assessment.questionBank.questions;
    let correctCount = 0;
    const answersToCreate: {
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }[] = [];

    for (const [questionId, selectedOptionId] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === questionId);
      if (!question) continue;

      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (isCorrect) {
        correctCount += 1;
      }

      answersToCreate.push({ questionId, selectedOptionId, isCorrect });
    }

    // Store answers
    for (const ans of answersToCreate) {
      await this.prisma.complianceAttemptAnswer.create({
        data: {
          attemptId,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId,
          isCorrect: ans.isCorrect,
        },
      });
    }

    // Calculate score and percentage — reuse PassFailEvaluationService
    const totalQuestions = attempt.assessment.sampleSize;
    const percentage = this.passFailEvaluationService.calculatePercentage(
      correctCount,
      totalQuestions,
    );

    // Calculate time taken
    const timeTakenSeconds = Math.floor(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000,
    );

    // Enforce time limit check if enabled
    let passed = percentage >= attempt.assessment.passingScore;
    if (attempt.assessment.timeLimitEnabled && timeTakenSeconds > attempt.assessment.timeLimit) {
      passed = false;
    }

    // Store BOTH score AND percentage — never derive percentage later
    const updatedAttempt = await this.prisma.complianceAssessmentAttempt.update({
      where: { id: attemptId },
      data: {
        score: correctCount,
        percentage,
        passed,
        completedAt: new Date(),
        timeTakenSeconds,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.COMPLIANCE_ASSESSMENT_PUBLISHED,
      `ComplianceAttemptCompleted: attemptId=${attemptId}, score=${correctCount}, percentage=${percentage}, passed=${passed}`,
    );

    return {
      attemptId: updatedAttempt.id,
      score: correctCount,
      percentage,
      passed,
      timeTakenSeconds,
      totalQuestions,
    };
  }

  // ─────────────────── ATTEMPT RESULT ───────────────────

  async getAttemptResult(userId: string, attemptId: string) {
    const attempt = await this.prisma.complianceAssessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: true,
        attemptAnswers: {
          include: {
            question: {
              include: { options: true },
            },
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Compliance attempt not found');
    }

    if (!attempt.completedAt) {
      throw new BadRequestException('Attempt is not completed yet');
    }

    const questions = attempt.attemptAnswers.map((ans) => {
      const correctOption = ans.question.options.find((o) => o.isCorrect);
      return {
        questionId: ans.questionId,
        questionText: ans.question.text,
        explanation: ans.question.explanation,
        selectedOptionId: ans.selectedOptionId,
        selectedOptionText: ans.selectedOption.text,
        isCorrect: ans.isCorrect,
        correctOptionId: correctOption?.id ?? '',
        correctOptionText: correctOption?.text ?? '',
        options: ans.question.options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
      };
    });

    return {
      attemptId: attempt.id,
      assessmentTitle: attempt.assessment.title,
      complianceTrack: attempt.assessment.complianceTrack,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passingScore: attempt.assessment.passingScore,
      totalQuestions: attempt.assessment.sampleSize,
      timeTakenSeconds: attempt.timeTakenSeconds,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      questions,
    };
  }

  // ─────────────────── ATTEMPT HISTORY ───────────────────

  async getAttemptHistory(assessmentId: string, userId: string) {
    const assessment = await this.prisma.complianceAssessment.findUnique({
      where: { id: assessmentId },
      select: { id: true, title: true, sampleSize: true, complianceTrack: true },
    });

    if (!assessment) {
      throw new NotFoundException('Compliance assessment not found');
    }

    const attempts = await this.prisma.complianceAssessmentAttempt.findMany({
      where: {
        assessmentId,
        userId,
        completedAt: { not: null },
      },
      orderBy: { startedAt: 'desc' },
    });

    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      complianceTrack: assessment.complianceTrack,
      totalAttempts: attempts.length,
      attempts: attempts.map((a) => ({
        attemptId: a.id,
        score: a.score,
        percentage: a.percentage,
        passed: a.passed,
        timeTakenSeconds: a.timeTakenSeconds,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
      })),
    };
  }

  // ─────────────────── MY COMPLIANCE HISTORY ───────────────────

  async getMyComplianceHistory(userId: string) {
    const attempts = await this.prisma.complianceAssessmentAttempt.findMany({
      where: { userId },
      include: {
        assessment: {
          select: { title: true, complianceTrack: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return {
      userId,
      attempts: attempts.map((a) => ({
        attemptId: a.id,
        assessmentId: a.assessmentId,
        assessmentTitle: a.assessment.title,
        complianceTrack: a.assessment.complianceTrack,
        score: a.score,
        percentage: a.percentage,
        passed: a.passed,
        timeTakenSeconds: a.timeTakenSeconds,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
      })),
    };
  }
}
