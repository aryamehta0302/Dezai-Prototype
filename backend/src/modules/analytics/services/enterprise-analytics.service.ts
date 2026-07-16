/**
 * @module modules/analytics/services/enterprise-analytics.service
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only. Does not modify AnalyticsService.
 */

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class EnterpriseAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Organization ID Resolution ─────────────────────────────────────────────

  private async resolveOrgId(userId: string, requestedOrgId?: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organizationAdmin: true, employee: true },
    });
    if (!user) throw new ForbiddenException('User not found');

    if (user.role === UserRole.DEZAI_ADMIN && requestedOrgId) return requestedOrgId;

    const orgId =
      user.organizationAdmin?.organizationId ?? user.employee?.organizationId;
    if (!orgId) throw new ForbiddenException('Organization access is required');

    if (requestedOrgId && requestedOrgId !== orgId) {
      throw new ForbiddenException('You do not have access to this organization');
    }
    return orgId;
  }

  // ─── KPI Overview ────────────────────────────────────────────────────────────

  async getOverview(userId: string, requestedOrgId?: string) {
    const organizationId = await this.resolveOrgId(userId, requestedOrgId);

    const [totalEmployees, activeEmployees, totalCredentials, activeCredentials, attemptAgg] =
      await Promise.all([
        this.prisma.employee.count({ where: { organizationId } }),
        this.prisma.employee.count({ where: { organizationId, employmentStatus: 'ACTIVE' } }),
        this.prisma.enterpriseCredential.count({ where: { organizationId } }),
        this.prisma.enterpriseCredential.count({
          where: { organizationId, verificationStatus: 'ACTIVE' },
        }),
        this.prisma.complianceAssessmentAttempt.aggregate({
          where: { employee: { organizationId } },
          _count: { id: true },
          _avg: { percentage: true },
        }),
      ]);

    const passedCount = await this.prisma.complianceAssessmentAttempt.count({
      where: { employee: { organizationId }, passed: true },
    });

    const assessmentsTaken = attemptAgg._count.id;
    const overallComplianceRate =
      totalEmployees > 0 ? Math.round((passedCount / totalEmployees) * 100) : 0;
    const averageScore = Math.round((attemptAgg._avg.percentage ?? 0) * 10) / 10;

    return {
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        overallComplianceRate,
        totalCredentials,
        activeCredentials,
        assessmentsTaken,
        averageScore,
      },
    };
  }

  // ─── Track Breakdown ─────────────────────────────────────────────────────────

  async getTrackBreakdown(userId: string, requestedOrgId?: string) {
    const organizationId = await this.resolveOrgId(userId, requestedOrgId);

    const tracks = await this.prisma.complianceAssessment.groupBy({
      by: ['complianceTrack'],
      where: { organizationId },
    });

    const results = await Promise.all(
      tracks.map(async ({ complianceTrack }) => {
        const [totalAttempts, passedAttempts, credentialsIssued] = await Promise.all([
          this.prisma.complianceAssessmentAttempt.count({
            where: { assessment: { organizationId, complianceTrack }, employee: { organizationId } },
          }),
          this.prisma.complianceAssessmentAttempt.count({
            where: { assessment: { organizationId, complianceTrack }, passed: true },
          }),
          this.prisma.enterpriseCredential.count({
            where: { organizationId, complianceTrack },
          }),
        ]);
        const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
        return { track: complianceTrack, totalAttempts, passedAttempts, passRate, credentialsIssued };
      }),
    );

    return { success: true, data: results };
  }

  // ─── Department Breakdown ────────────────────────────────────────────────────

  async getDepartmentBreakdown(userId: string, requestedOrgId?: string) {
    const organizationId = await this.resolveOrgId(userId, requestedOrgId);

    const departments = await this.prisma.department.findMany({
      where: { organizationId },
      include: { employees: { select: { id: true, employmentStatus: true } } },
    });

    const results = await Promise.all(
      departments.map(async (dept) => {
        const employeeIds = dept.employees.map((e) => e.id);
        const employeeCount = employeeIds.length;

        const [compliantCount, credentialCount] = await Promise.all([
          this.prisma.complianceAssessmentAttempt.count({
            where: { employeeId: { in: employeeIds }, passed: true },
          }),
          this.prisma.enterpriseCredential.count({
            where: { employeeId: { in: employeeIds }, verificationStatus: 'ACTIVE' },
          }),
        ]);

        const complianceRate =
          employeeCount > 0 ? Math.round((compliantCount / employeeCount) * 100) : 0;

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          employeeCount,
          compliantCount,
          complianceRate,
          credentialCount,
        };
      }),
    );

    return { success: true, data: results };
  }

  // ─── Employee List (Paginated) ────────────────────────────────────────────────

  async getEmployeeCompliance(
    userId: string,
    page = 1,
    limit = 20,
    requestedOrgId?: string,
  ) {
    const organizationId = await this.resolveOrgId(userId, requestedOrgId);
    const skip = (page - 1) * limit;

    const [total, employees] = await Promise.all([
      this.prisma.employee.count({ where: { organizationId } }),
      this.prisma.employee.findMany({
        where: { organizationId },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
          complianceAttempts: {
            orderBy: { completedAt: 'desc' },
            take: 1,
            select: { score: true, passed: true, completedAt: true },
          },
          enterpriseCredentials: {
            where: { verificationStatus: 'ACTIVE' },
            select: { id: true, complianceTrack: true },
          },
        },
      }),
    ]);

    const data = employees.map((emp) => {
      const lastAttempt = emp.complianceAttempts[0] ?? null;
      return {
        employeeId: emp.id,
        name: emp.user.name ?? 'Unknown',
        email: emp.user.email,
        department: emp.department?.name ?? '—',
        title: emp.title ?? '',
        employmentStatus: emp.employmentStatus,
        lastAttemptScore: lastAttempt ? lastAttempt.score : null,
        lastAttemptPassed: lastAttempt ? lastAttempt.passed : null,
        lastAttemptDate: lastAttempt?.completedAt?.toISOString() ?? null,
        activeCredentials: emp.enterpriseCredentials.length,
        complianceTracks: emp.enterpriseCredentials.map((c) => c.complianceTrack),
      };
    });

    return {
      success: true,
      data: { data, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Activity Feed ────────────────────────────────────────────────────────────

  async getActivityFeed(userId: string, requestedOrgId?: string) {
    const organizationId = await this.resolveOrgId(userId, requestedOrgId);

    const [recentAttempts, recentCredentials] = await Promise.all([
      this.prisma.complianceAssessmentAttempt.findMany({
        where: { employee: { organizationId } },
        orderBy: { completedAt: 'desc' },
        take: 15,
        include: {
          employee: { include: { user: { select: { name: true } } } },
          assessment: { select: { title: true, complianceTrack: true } },
        },
      }),
      this.prisma.enterpriseCredential.findMany({
        where: { organizationId },
        orderBy: { issuedAt: 'desc' },
        take: 10,
        include: {
          employee: { include: { user: { select: { name: true } } } },
        },
      }),
    ]);

    const feed = [
      ...recentAttempts
        .filter((a) => a.completedAt)
        .map((a) => ({
          id: a.id,
          type: 'ASSESSMENT' as const,
          timestamp: a.completedAt!.toISOString(),
          employeeName: a.employee.user.name ?? 'Unknown',
          detail: `${a.passed ? 'Passed' : 'Failed'} "${a.assessment.title}" — ${a.assessment.complianceTrack}`,
          passed: a.passed,
        })),
      ...recentCredentials.map((c) => ({
        id: c.id,
        type: 'CREDENTIAL' as const,
        timestamp: c.issuedAt.toISOString(),
        employeeName: c.employee.user.name ?? 'Unknown',
        detail: `Credential issued for ${c.complianceTrack}`,
        passed: true,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return { success: true, data: feed };
  }
}
