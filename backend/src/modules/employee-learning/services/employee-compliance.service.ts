import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EmployeeLearningRepository } from '../repositories/employee-learning.repository';
import { AuditService } from '../../audit/services/audit.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { AuditAction, NotificationType } from '@prisma/client';
import { SubmitComplianceAttemptDto } from '../dto/submit-compliance-attempt.dto';
import {
  AssessmentWithStatus,
  AssessmentQuestion,
  AttemptResult,
  AttemptQuestionBreakdown,
} from '../types/employee-learning.types';

@Injectable()
export class EmployeeComplianceService {
  constructor(
    private readonly repo: EmployeeLearningRepository,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listAssessments(userId: string): Promise<AssessmentWithStatus[]> {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const [assessments, attempts] = await Promise.all([
      this.repo.findComplianceAssessmentsForOrg(employee.organizationId, employee.departmentId),
      this.repo.findAttemptsByUser(userId),
    ]);

    return assessments.map((assessment) => {
      const assessmentAttempts = attempts.filter((a) => a.assessmentId === assessment.id);
      const bestAttempt = assessmentAttempts.length > 0
        ? assessmentAttempts.reduce((best, a) => (a.percentage > best.percentage ? a : best))
        : null;
      const hasActive = assessmentAttempts.some((a) => !a.completedAt);

      return {
        id: assessment.id,
        title: assessment.title,
        complianceTrack: assessment.complianceTrack,
        passingScore: assessment.passingScore,
        sampleSize: assessment.sampleSize,
        timeLimit: assessment.timeLimit,
        timeLimitEnabled: assessment.timeLimitEnabled,
        maxAttempts: assessment.maxAttempts,
        attemptsUsed: assessmentAttempts.length,
        bestScore: bestAttempt?.score || null,
        bestPercentage: bestAttempt?.percentage || null,
        everPassed: assessmentAttempts.some((a) => a.passed),
        hasActiveAttempt: hasActive,
        lastAttemptAt: assessmentAttempts.length > 0 ? assessmentAttempts[0].startedAt : null,
        questionCount: assessment.questionBank.questions.length,
      };
    });
  }

  async getAssessmentDetail(userId: string, assessmentId: string) {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const assessment = await this.repo.findAssessmentById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (assessment.organizationId !== employee.organizationId) {
      throw new BadRequestException('Assessment not available to this employee');
    }

    return {
      id: assessment.id,
      title: assessment.title,
      complianceTrack: assessment.complianceTrack,
      passingScore: assessment.passingScore,
      sampleSize: assessment.sampleSize,
      timeLimit: assessment.timeLimit,
      timeLimitEnabled: assessment.timeLimitEnabled,
      maxAttempts: assessment.maxAttempts,
      questionCount: assessment.questionBank.questions.length,
    };
  }

  async startAttempt(userId: string, assessmentId: string) {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const assessment = await this.repo.findAssessmentById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (assessment.organizationId !== employee.organizationId) {
      throw new BadRequestException('Assessment not available to this employee');
    }

    const hasActive = await this.repo.hasActiveAttempt(userId, assessmentId);
    if (hasActive) {
      throw new ConflictException('You already have an active attempt for this assessment');
    }

    const attemptCount = await this.repo.countAttempts(userId, assessmentId);
    if (attemptCount >= assessment.maxAttempts) {
      throw new BadRequestException(`Maximum ${assessment.maxAttempts} attempts reached`);
    }

    const attempt = await this.repo.createAttempt({
      userId,
      employeeId: employee.id,
      assessmentId,
    });

    const questions = this.selectQuestions(
      attempt.assessment.questionBank.questions,
      assessment.sampleSize,
    );

    await this.auditService.logAction(userId, AuditAction.COMPLIANCE_ASSESSMENT_PUBLISHED, `Compliance assessment "${assessment.title}" started (attempt ${attemptCount + 1})`);

    return {
      attemptId: attempt.id,
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      complianceTrack: assessment.complianceTrack,
      timeLimit: assessment.timeLimit,
      timeLimitEnabled: assessment.timeLimitEnabled,
      questions,
      startedAt: attempt.startedAt,
    };
  }

  async submitAttempt(userId: string, assessmentId: string, dto: SubmitComplianceAttemptDto) {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const assessment = await this.repo.findAssessmentById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const attempt = await this.repo.findAttemptWithAnswers(
      (await this.findActiveAttempt(userId, assessmentId))?.id || '',
    );

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('No active attempt found');
    }

    const allQuestions = assessment.questionBank.questions;
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    let correct = 0;
    const answerData: Array<{
      attemptId: string;
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }> = [];

    for (const [questionId, selectedOptionId] of Object.entries(dto.answers)) {
      const question = questionMap.get(questionId);
      if (!question) continue;

      const isCorrect = question.options.some(
        (opt) => opt.id === selectedOptionId && opt.isCorrect,
      );
      if (isCorrect) correct++;

      answerData.push({
        attemptId: attempt.id,
        questionId,
        selectedOptionId,
        isCorrect,
      });
    }

    const totalQuestions = allQuestions.length;
    const score = correct;
    const percentage = totalQuestions > 0
      ? Math.round((correct / totalQuestions) * 100 * 100) / 100
      : 0;
    const passed = percentage >= assessment.passingScore;

    await this.repo.createAttemptAnswers(answerData);

    const completedAt = new Date();
    const timeTakenSeconds = dto.timeTakenSeconds ||
      Math.round((completedAt.getTime() - attempt.startedAt.getTime()) / 1000);

    await this.repo.completeAttempt(attempt.id, {
      score,
      percentage,
      passed,
      completedAt,
      timeTakenSeconds,
    });

    const auditAction = passed
      ? AuditAction.ENTERPRISE_CREDENTIAL_ISSUED
      : AuditAction.COMPLIANCE_ASSESSMENT_PUBLISHED;
    await this.auditService.logAction(userId, auditAction, `Compliance assessment "${assessment.title}" ${passed ? 'passed' : 'failed'} with ${percentage}%`);

    if (passed) {
      await this.notificationsService.createNotification(
        userId,
        'Assessment Passed!',
        `You passed "${assessment.title}" with ${percentage}%. Your credential is being issued.`,
        NotificationType.UPDATE,
      );
    }

    return {
      attemptId: attempt.id,
      assessmentId,
      score,
      percentage,
      passed,
      passingScore: assessment.passingScore,
      totalQuestions,
      timeTakenSeconds,
      startedAt: attempt.startedAt,
      completedAt,
    };
  }

  async getAttemptHistory(userId: string, assessmentId: string) {
    const attempts = await this.repo.findAttemptsByUser(userId, assessmentId);
    return attempts.map((a) => ({
      id: a.id,
      score: a.score,
      percentage: a.percentage,
      passed: a.passed,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      timeTakenSeconds: a.timeTakenSeconds,
    }));
  }

  async getAttemptResult(userId: string, attemptId: string): Promise<AttemptResult> {
    const attempt = await this.repo.findAttemptWithAnswers(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Attempt not found');
    }

    const questions: AttemptQuestionBreakdown[] = attempt.attemptAnswers.map((answer) => {
      const correctOption = answer.question.options.find((o) => o.isCorrect);
      return {
        questionId: answer.questionId,
        questionText: answer.question.text,
        selectedOptionId: answer.selectedOptionId,
        selectedOptionText: answer.selectedOption?.text || null,
        isCorrect: answer.isCorrect,
        correctOptionId: correctOption?.id || '',
        correctOptionText: correctOption?.text || '',
        options: answer.question.options.map((o) => ({ id: o.id, text: o.text })),
        explanation: answer.question.explanation,
      };
    });

    return {
      attemptId: attempt.id,
      assessmentId: attempt.assessmentId,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passingScore: attempt.assessment.passingScore,
      totalQuestions: attempt.attemptAnswers.length,
      timeTakenSeconds: attempt.timeTakenSeconds,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt || new Date(),
      questions,
    };
  }

  private async findActiveAttempt(userId: string, assessmentId: string) {
    const attempts = await this.repo.findAttemptsByUser(userId, assessmentId);
    return attempts.find((a) => !a.completedAt) || null;
  }

  private selectQuestions(
    questions: Array<{ id: string; text: string; category: string | null; difficulty: string; timerSeconds: number; options: { id: string; text: string }[] }>,
    sampleSize: number,
  ): AssessmentQuestion[] {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, sampleSize).map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category,
      difficulty: q.difficulty,
      timerSeconds: q.timerSeconds,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    }));
  }
}
