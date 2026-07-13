import { Injectable, BadRequestException } from '@nestjs/common';
import { EmployeeLearningRepository } from '../repositories/employee-learning.repository';
import { TrackProgress } from '../types/employee-learning.types';
import { ComplianceTrack } from '@prisma/client';

const TRACK_LABELS: Record<ComplianceTrack, string> = {
  CYBER_SECURITY: 'Cyber Security',
  PASSWORD_SECURITY: 'Password Security',
  DATA_PRIVACY: 'Data Privacy',
  SECURE_EMAIL: 'Secure Email',
};

@Injectable()
export class EmployeeProgressService {
  constructor(private readonly repo: EmployeeLearningRepository) {}

  async getTrackProgressList(userId: string): Promise<TrackProgress[]> {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const [assessments, attempts, credentials] = await Promise.all([
      this.repo.findComplianceAssessmentsForOrg(employee.organizationId, employee.departmentId),
      this.repo.findAttemptsByUser(userId),
      this.repo.findCredentialsByUser(userId),
    ]);

    return this.buildTrackProgress(assessments, attempts, credentials);
  }

  async getTrackProgressDetail(userId: string, track: ComplianceTrack) {
    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    const [assessments, attempts, credentials] = await Promise.all([
      this.repo.findComplianceAssessmentsForOrg(employee.organizationId, employee.departmentId),
      this.repo.findAttemptsByUser(userId),
      this.repo.findCredentialsByUser(userId),
    ]);

    const trackAssessments = assessments.filter((a) => a.complianceTrack === track);
    const trackAttempts = attempts.filter((a) =>
      trackAssessments.some((ta) => ta.id === a.assessmentId),
    );
    const trackCredentials = credentials.filter((c) => c.complianceTrack === track);

    const assessmentsWithStatus = trackAssessments.map((assessment) => {
      const assessmentAttempts = trackAttempts.filter((a) => a.assessmentId === assessment.id);
      const bestAttempt = assessmentAttempts.length > 0
        ? assessmentAttempts.reduce((best, a) => (a.percentage > best.percentage ? a : best))
        : null;

      return {
        id: assessment.id,
        title: assessment.title,
        complianceTrack: assessment.complianceTrack,
        passingScore: assessment.passingScore,
        maxAttempts: assessment.maxAttempts,
        attemptsUsed: assessmentAttempts.length,
        bestScore: bestAttempt?.score || null,
        bestPercentage: bestAttempt?.percentage || null,
        everPassed: assessmentAttempts.some((a) => a.passed),
        lastAttemptAt: assessmentAttempts.length > 0 ? assessmentAttempts[0].startedAt : null,
      };
    });

    return {
      track,
      label: TRACK_LABELS[track],
      totalAssessments: trackAssessments.length,
      passedAssessments: new Set(
        trackAttempts.filter((a) => a.passed).map((a) => a.assessmentId),
      ).size,
      credentialsEarned: trackCredentials.length,
      assessments: assessmentsWithStatus,
    };
  }

  private buildTrackProgress(
    assessments: Array<{ id: string; complianceTrack: ComplianceTrack }>,
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
      const passedIds = new Set(
        trackAttempts.filter((a) => a.passed).map((a) => a.assessmentId),
      );

      const total = trackAssessments.length;
      const passed = passedIds.size;
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
