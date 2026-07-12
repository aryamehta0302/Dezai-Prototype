import { Injectable, BadRequestException } from '@nestjs/common';
import { EmployeeLearningRepository } from '../repositories/employee-learning.repository';
import { DashboardStats, TrackProgress } from '../types/employee-learning.types';
import { ComplianceTrack } from '@prisma/client';

const TRACK_LABELS: Record<ComplianceTrack, string> = {
  CYBER_SECURITY: 'Cyber Security',
  PASSWORD_SECURITY: 'Password Security',
  DATA_PRIVACY: 'Data Privacy',
  SECURE_EMAIL: 'Secure Email',
};

@Injectable()
export class EmployeeDashboardService {
  constructor(private readonly repo: EmployeeLearningRepository) {}

  async getDashboard(userId: string): Promise<DashboardStats> {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const [assessments, attempts, credentials, userData, position] = await Promise.all([
      this.repo.findComplianceAssessmentsForOrg(employee.organizationId, employee.departmentId),
      this.repo.findAttemptsByUser(userId),
      this.repo.findCredentialsByUser(userId),
      this.repo.getUserXp(userId),
      this.repo.getLeaderboardUserPosition(employee.organizationId, userId),
    ]);

    const passedAttemptIds = new Set(
      attempts.filter((a) => a.passed).map((a) => a.assessmentId),
    );

    const trackProgress = this.buildTrackProgress(assessments, attempts, credentials);

    return {
      totalAssessmentsAvailable: assessments.length,
      assessmentsAttempted: new Set(attempts.map((a) => a.assessmentId)).size,
      assessmentsPassed: passedAttemptIds.size,
      credentialsEarned: credentials.length,
      totalXpEarned: userData?.xp || 0,
      currentStreak: userData?.streakCount || 0,
      longestStreak: userData?.streakCount || 0,
      orgRank: position?.rank || null,
      trackProgress,
    };
  }

  private buildTrackProgress(
    assessments: Array<{ id: string; complianceTrack: ComplianceTrack; questionBank: { questions: { id: string }[] } }>,
    attempts: Array<{ assessmentId: string; passed: boolean; startedAt: Date }>,
    credentials: Array<{ complianceTrack: ComplianceTrack }>,
  ): TrackProgress[] {
    const tracks = new Set<ComplianceTrack>(assessments.map((a) => a.complianceTrack));

    return Array.from(tracks).map((track) => {
      const trackAssessments = assessments.filter((a) => a.complianceTrack === track);
      const trackAttempts = attempts.filter((a) =>
        trackAssessments.some((ta) => ta.id === a.assessmentId),
      );
      const trackCredentials = credentials.filter((c) => c.complianceTrack === track);
      const passedAssessmentIds = new Set(
        trackAttempts.filter((a) => a.passed).map((a) => a.assessmentId),
      );

      const total = trackAssessments.length;
      const passed = passedAssessmentIds.size;
      const lastActivity = trackAttempts.length > 0
        ? trackAttempts.reduce((latest, a) => a.startedAt > latest ? a.startedAt : latest, trackAttempts[0].startedAt)
        : null;

      return {
        track,
        label: TRACK_LABELS[track],
        totalAssessments: total,
        attemptedAssessments: new Set(trackAttempts.map((a) => a.assessmentId)).size,
        passedAssessments: passed,
        credentialsEarned: trackCredentials.length,
        completionPercentage: total > 0 ? Math.round((passed / total) * 100) : 0,
        lastActivityAt: lastActivity,
      };
    });
  }
}
