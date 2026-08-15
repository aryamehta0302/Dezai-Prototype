import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PlatformAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getPlatformOverview() {
    const [
      totalUsers,
      totalInstitutions,
      totalDepartments,
      totalPrograms,
      totalAssessments,
      totalCredentials,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.institution.count(),
      this.prisma.institutionDepartment.count(),
      this.prisma.program.count(),
      this.prisma.assessment.count(),
      this.prisma.credential.count(),
    ]);

    const xpAggregate = await this.prisma.user.aggregate({
      _sum: { xp: true },
    });

    return {
      totalUsers,
      totalInstitutions,
      totalDepartments,
      totalPrograms,
      totalAssessments,
      totalCredentialsIssued: totalCredentials,
      totalXpAwarded: xpAggregate._sum.xp || 0,
    };
  }

  async getGrowthTrends(period: string = '30d') {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [newUsers, newEnrollments, newInstitutions] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.enrollment.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.institution.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    return {
      period,
      sinceDate: startDate,
      newUsers,
      newEnrollments,
      newInstitutions,
    };
  }

  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return { users: [], institutions: [], programs: [], departments: [] };
    }

    const q = query.trim();

    const [users, institutions, programs, departments] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true, role: true, accountStatus: true },
        take: 10,
      }),
      this.prisma.institution.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, status: true, country: true },
        take: 10,
      }),
      this.prisma.program.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, institutionId: true },
        take: 10,
      }),
      this.prisma.institutionDepartment.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, code: true, institutionId: true },
        take: 10,
      }),
    ]);

    return { users, institutions, programs, departments };
  }
}
