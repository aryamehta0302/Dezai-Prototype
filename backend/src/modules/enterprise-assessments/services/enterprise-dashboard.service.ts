import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ComplianceTrack } from '@prisma/client';
import { PassFailEvaluationService } from '../../assessments/services/pass-fail-evaluation.service';

@Injectable()
export class EnterpriseDashboardService {
  private readonly logger = new Logger(EnterpriseDashboardService.name);

  constructor(
    private prisma: PrismaService,
    private passFailEvaluationService: PassFailEvaluationService,
  ) {}

  // ─────────────────── ORGANIZATION DASHBOARD ───────────────────

  async getOrganizationDashboard(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const assessments = await this.prisma.complianceAssessment.findMany({
      where: { organizationId },
      select: { id: true, complianceTrack: true, sampleSize: true, passingScore: true },
    });

    const assessmentIds = assessments.map((a) => a.id);

    const attempts = await this.prisma.complianceAssessmentAttempt.findMany({
      where: {
        assessmentId: { in: assessmentIds },
        completedAt: { not: null },
      },
      select: {
        score: true,
        percentage: true,
        passed: true,
        assessmentId: true,
      },
    });

    const totalAssessments = assessments.length;
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const passRate =
      totalAttempts > 0
        ? this.passFailEvaluationService.calculatePercentage(passedAttempts, totalAttempts)
        : 0;
    const avgPercentage =
      totalAttempts > 0
        ? Math.round(
            (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) * 100,
          ) / 100
        : 0;

    // Per-track breakdown
    const trackBreakdown = this.buildTrackBreakdown(assessments, attempts);

    // Employee count
    const totalEmployees = await this.prisma.employee.count({
      where: { organizationId },
    });

    return {
      organizationId,
      organizationName: org.name,
      totalAssessments,
      totalAttempts,
      totalEmployees,
      passRate,
      averagePercentage: avgPercentage,
      trackBreakdown,
    };
  }

  // ─────────────────── DEPARTMENT DASHBOARD ───────────────────

  async getDepartmentDashboard(departmentId: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: { organization: { select: { name: true } } },
    });
    if (!dept) throw new NotFoundException('Department not found');

    // Get org-wide + dept-specific assessments
    const assessments = await this.prisma.complianceAssessment.findMany({
      where: {
        organizationId: dept.organizationId,
        OR: [
          { departmentId },
          { departmentId: null },
        ],
      },
      select: { id: true, complianceTrack: true, sampleSize: true, passingScore: true },
    });

    // Get employees in this department
    const employees = await this.prisma.employee.findMany({
      where: { departmentId },
      select: { userId: true },
    });
    const employeeUserIds = employees.map((e) => e.userId);

    const attempts = await this.prisma.complianceAssessmentAttempt.findMany({
      where: {
        assessmentId: { in: assessments.map((a) => a.id) },
        userId: { in: employeeUserIds },
        completedAt: { not: null },
      },
      select: {
        score: true,
        percentage: true,
        passed: true,
        assessmentId: true,
      },
    });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const passRate =
      totalAttempts > 0
        ? this.passFailEvaluationService.calculatePercentage(passedAttempts, totalAttempts)
        : 0;

    const trackBreakdown = this.buildTrackBreakdown(assessments, attempts);

    return {
      departmentId,
      departmentName: dept.name,
      organizationName: dept.organization.name,
      totalAssessments: assessments.length,
      totalAttempts,
      totalEmployees: employees.length,
      passRate,
      trackBreakdown,
    };
  }

  // ─────────────────── EMPLOYEE DASHBOARD ───────────────────

  async getEmployeeDashboard(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        organization: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    // Get all assessments for this org
    const assessments = await this.prisma.complianceAssessment.findMany({
      where: {
        organizationId: employee.organizationId,
        OR: [
          { departmentId: employee.departmentId },
          { departmentId: null },
        ],
      },
      select: {
        id: true,
        title: true,
        complianceTrack: true,
        passingScore: true,
        sampleSize: true,
      },
    });

    // Get all attempts for this user
    const attempts = await this.prisma.complianceAssessmentAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      select: {
        assessmentId: true,
        score: true,
        percentage: true,
        passed: true,
        completedAt: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    // Per-track compliance status
    const tracks = Object.values(ComplianceTrack).map((track) => {
      const trackAssessments = assessments.filter((a) => a.complianceTrack === track);
      const trackAttempts = attempts.filter((att) =>
        trackAssessments.some((a) => a.id === att.assessmentId),
      );
      const passed = trackAttempts.some((a) => a.passed);
      const bestPercentage =
        trackAttempts.length > 0
          ? Math.max(...trackAttempts.map((a) => a.percentage))
          : 0;

      return {
        track,
        totalAssessments: trackAssessments.length,
        attemptsMade: trackAttempts.length,
        passed,
        bestPercentage,
      };
    });

    const overallCompliance = tracks.filter((t) => t.passed).length;
    const totalTracks = tracks.filter((t) => t.totalAssessments > 0).length;

    return {
      userId,
      employeeId: employee.id,
      organizationName: employee.organization.name,
      departmentName: employee.department?.name ?? null,
      overallComplianceRate:
        totalTracks > 0
          ? this.passFailEvaluationService.calculatePercentage(overallCompliance, totalTracks)
          : 0,
      tracks,
    };
  }

  // ─────────────────── TRACK SUMMARY ───────────────────

  async getComplianceTrackSummary(organizationId: string, track: ComplianceTrack) {
    const assessments = await this.prisma.complianceAssessment.findMany({
      where: { organizationId, complianceTrack: track },
      select: { id: true, title: true, sampleSize: true, passingScore: true },
    });

    if (assessments.length === 0) {
      return {
        track,
        totalAssessments: 0,
        totalAttempts: 0,
        passRate: 0,
        averagePercentage: 0,
        assessments: [],
      };
    }

    const assessmentIds = assessments.map((a) => a.id);

    const attempts = await this.prisma.complianceAssessmentAttempt.findMany({
      where: {
        assessmentId: { in: assessmentIds },
        completedAt: { not: null },
      },
      select: {
        assessmentId: true,
        percentage: true,
        passed: true,
      },
    });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const passRate =
      totalAttempts > 0
        ? this.passFailEvaluationService.calculatePercentage(passedAttempts, totalAttempts)
        : 0;
    const avgPercentage =
      totalAttempts > 0
        ? Math.round(
            (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) * 100,
          ) / 100
        : 0;

    const assessmentDetails = assessments.map((a) => {
      const aAttempts = attempts.filter((att) => att.assessmentId === a.id);
      return {
        id: a.id,
        title: a.title,
        totalAttempts: aAttempts.length,
        passRate:
          aAttempts.length > 0
            ? this.passFailEvaluationService.calculatePercentage(
                aAttempts.filter((att) => att.passed).length,
                aAttempts.length,
              )
            : 0,
      };
    });

    return {
      track,
      totalAssessments: assessments.length,
      totalAttempts,
      passRate,
      averagePercentage: avgPercentage,
      assessments: assessmentDetails,
    };
  }

  // ─────────────────── HELPER ───────────────────

  private buildTrackBreakdown(
    assessments: { id: string; complianceTrack: ComplianceTrack }[],
    attempts: { assessmentId: string; percentage: number; passed: boolean }[],
  ) {
    return Object.values(ComplianceTrack).map((track) => {
      const trackAssessmentIds = assessments
        .filter((a) => a.complianceTrack === track)
        .map((a) => a.id);
      const trackAttempts = attempts.filter((att) =>
        trackAssessmentIds.includes(att.assessmentId),
      );
      const totalAttempts = trackAttempts.length;
      const passedAttempts = trackAttempts.filter((a) => a.passed).length;

      return {
        track,
        totalAssessments: trackAssessmentIds.length,
        totalAttempts,
        passRate:
          totalAttempts > 0
            ? this.passFailEvaluationService.calculatePercentage(passedAttempts, totalAttempts)
            : 0,
        averagePercentage:
          totalAttempts > 0
            ? Math.round(
                (trackAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) * 100,
              ) / 100
            : 0,
      };
    });
  }
}
