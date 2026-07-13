import { Injectable, BadRequestException } from '@nestjs/common';
import { EmployeeLearningRepository } from '../repositories/employee-learning.repository';
import { ActivityEvent, ActivityType, DailyActivity } from '../types/employee-learning.types';

@Injectable()
export class EmployeeTimelineService {
  constructor(private readonly repo: EmployeeLearningRepository) {}

  async getTimeline(userId: string, options?: { limit?: number; offset?: number }) {
    const limit = Math.min(options?.limit || 20, 100);
    const offset = options?.offset || 0;

    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const [attempts, credentials, xpTransactions] = await Promise.all([
      this.repo.findAttemptsByUser(userId),
      this.repo.findCredentialsByUser(userId),
      this.repo.getXpTransactions(userId),
    ]);

    const events: ActivityEvent[] = [];

    for (const attempt of attempts) {
      const type: ActivityType = attempt.passed ? 'ASSESSMENT_PASSED' : attempt.completedAt ? 'ASSESSMENT_FAILED' : 'ASSESSMENT_STARTED';
      events.push({
        id: attempt.id,
        type,
        timestamp: attempt.completedAt || attempt.startedAt,
        description: attempt.passed
          ? `Passed "${attempt.assessment.title}" with ${attempt.percentage}%`
          : attempt.completedAt
            ? `Completed "${attempt.assessment.title}" with ${attempt.percentage}%`
            : `Started "${attempt.assessment.title}"`,
        metadata: {
          assessmentId: attempt.assessmentId,
          assessmentTitle: attempt.assessment.title,
          score: attempt.score,
          percentage: attempt.percentage,
          passed: attempt.passed,
          complianceTrack: attempt.assessment.complianceTrack,
        },
      });
    }

    for (const credential of credentials) {
      events.push({
        id: credential.id,
        type: 'CREDENTIAL_EARNED',
        timestamp: credential.issuedAt,
        description: `Earned ${credential.complianceTrack.replace(/_/g, ' ').toLowerCase()} credential`,
        metadata: {
          credentialId: credential.id,
          complianceTrack: credential.complianceTrack,
          verificationCode: credential.verificationCode,
          assessmentTitle: credential.complianceAssessment?.title,
        },
      });
    }

    for (const xp of xpTransactions) {
      events.push({
        id: xp.id,
        type: 'XP_EARNED',
        timestamp: xp.createdAt,
        description: `Earned ${xp.amount} XP for ${xp.type.replace(/_/g, ' ').toLowerCase()}`,
        metadata: {
          amount: xp.amount,
          xpType: xp.type,
        },
      });
    }

    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = events.length;
    const paginated = events.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      events: paginated,
      total,
      hasMore,
      nextCursor: hasMore ? offset + limit : null,
    };
  }

  async getDailyActivity(userId: string, year?: number): Promise<DailyActivity[]> {
    const targetYear = year || new Date().getFullYear();
    return this.repo.getDailyActivity(userId, targetYear);
  }

  async getHistory(userId: string) {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const [attempts, credentials] = await Promise.all([
      this.repo.findAttemptsByUser(userId),
      this.repo.findCredentialsByUser(userId),
    ]);

    const assessmentHistory = attempts.map((a) => ({
      id: a.id,
      assessmentId: a.assessmentId,
      assessmentTitle: a.assessment.title,
      complianceTrack: a.assessment.complianceTrack,
      score: a.score,
      percentage: a.percentage,
      passed: a.passed,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      timeTakenSeconds: a.timeTakenSeconds,
    }));

    const credentialHistory = credentials.map((c) => ({
      id: c.id,
      complianceTrack: c.complianceTrack,
      verificationCode: c.verificationCode,
      issuedAt: c.issuedAt,
      status: c.verificationStatus,
      assessmentTitle: c.complianceAssessment?.title,
    }));

    return {
      attempts: assessmentHistory,
      credentials: credentialHistory,
      summary: {
        totalAttempts: attempts.length,
        passedAttempts: attempts.filter((a) => a.passed).length,
        totalCredentials: credentials.length,
        activeCredentials: credentials.filter((c) => c.verificationStatus === 'ACTIVE').length,
      },
    };
  }
}
