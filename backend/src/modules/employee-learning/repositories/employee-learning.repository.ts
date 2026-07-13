import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class EmployeeLearningRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEmployeeByUserId(userId: string) {
    return this.prisma.employee.findUnique({
      where: { userId },
      include: { organization: true, department: true },
    });
  }

  async findComplianceAssessmentsForOrg(organizationId: string, departmentId?: string) {
    const where: Record<string, unknown> = { organizationId };
    if (departmentId) {
      where.departmentId = departmentId;
    }
    return this.prisma.complianceAssessment.findMany({
      where,
      include: {
        questionBank: { select: { questions: { select: { id: true } } } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAssessmentById(assessmentId: string) {
    return this.prisma.complianceAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        questionBank: {
          include: {
            questions: {
              include: { options: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        organization: true,
      },
    });
  }

  async findAttemptsByUser(userId: string, assessmentId?: string) {
    const where: Record<string, unknown> = { userId };
    if (assessmentId) where.assessmentId = assessmentId;
    return this.prisma.complianceAssessmentAttempt.findMany({
      where,
      include: {
        assessment: { select: { id: true, title: true, complianceTrack: true, passingScore: true } },
        attemptAnswers: {
          include: {
            question: { select: { id: true, text: true, category: true, difficulty: true, explanation: true, tags: true } },
            selectedOption: { select: { id: true, text: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findAttemptWithAnswers(attemptId: string) {
    return this.prisma.complianceAssessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: true,
        attemptAnswers: {
          include: {
            question: {
              include: { options: { select: { id: true, text: true, isCorrect: true } } },
            },
            selectedOption: { select: { id: true, text: true } },
          },
        },
      },
    });
  }

  async createAttempt(data: {
    userId: string;
    employeeId: string;
    assessmentId: string;
  }) {
    return this.prisma.complianceAssessmentAttempt.create({
      data,
      include: {
        assessment: {
          include: {
            questionBank: {
              include: {
                questions: {
                  include: { options: { select: { id: true, text: true } } },
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  }

  async createAttemptAnswers(data: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[]) {
    return this.prisma.complianceAttemptAnswer.createMany({ data });
  }

  async completeAttempt(attemptId: string, data: {
    score: number;
    percentage: number;
    passed: boolean;
    completedAt: Date;
    timeTakenSeconds?: number;
  }) {
    return this.prisma.complianceAssessmentAttempt.update({
      where: { id: attemptId },
      data,
    });
  }

  async countAttempts(userId: string, assessmentId: string) {
    return this.prisma.complianceAssessmentAttempt.count({
      where: { userId, assessmentId },
    });
  }

  async hasActiveAttempt(userId: string, assessmentId: string) {
    const attempt = await this.prisma.complianceAssessmentAttempt.findFirst({
      where: { userId, assessmentId, completedAt: null },
    });
    return !!attempt;
  }

  async findCredentialsByUser(userId: string) {
    return this.prisma.enterpriseCredential.findMany({
      where: { employee: { userId } },
      include: {
        complianceAssessment: { select: { id: true, title: true, complianceTrack: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findCredentialsByOrg(organizationId: string) {
    return this.prisma.enterpriseCredential.findMany({
      where: { organizationId },
      include: {
        employee: { include: { user: { select: { id: true, name: true, email: true } } } },
        complianceAssessment: { select: { id: true, title: true, complianceTrack: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async upsertNote(userId: string, assessmentId: string, content: string) {
    return this.prisma.employeeNote.upsert({
      where: { userId_assessmentId: { userId, assessmentId } },
      create: { userId, assessmentId, content },
      update: { content },
      include: {
        assessment: { select: { id: true, title: true } },
      },
    });
  }

  async findNote(userId: string, assessmentId: string) {
    return this.prisma.employeeNote.findUnique({
      where: { userId_assessmentId: { userId, assessmentId } },
      include: {
        assessment: { select: { id: true, title: true } },
      },
    });
  }

  async findAllNotes(userId: string) {
    return this.prisma.employeeNote.findMany({
      where: { userId },
      include: {
        assessment: { select: { id: true, title: true, complianceTrack: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async toggleBookmark(userId: string, assessmentId: string) {
    const existing = await this.prisma.employeeBookmark.findUnique({
      where: { userId_assessmentId: { userId, assessmentId } },
    });

    if (existing) {
      await this.prisma.employeeBookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    }

    await this.prisma.employeeBookmark.create({
      data: { userId, assessmentId },
    });
    return { bookmarked: true };
  }

  async findBookmarks(userId: string) {
    return this.prisma.employeeBookmark.findMany({
      where: { userId },
      include: {
        assessment: {
          select: { id: true, title: true, complianceTrack: true, passingScore: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isBookmarked(userId: string, assessmentId: string) {
    const bookmark = await this.prisma.employeeBookmark.findUnique({
      where: { userId_assessmentId: { userId, assessmentId } },
    });
    return !!bookmark;
  }

  async getUserXp(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, streakCount: true, lastActiveAt: true },
    });
    return user;
  }

  async getXpTransactions(userId: string, since?: Date) {
    const where: Record<string, unknown> = { userId };
    if (since) where.createdAt = { gte: since };
    return this.prisma.xpTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getXpTotalByOrg(organizationId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { organizationId },
      select: { userId: true },
    });
    const userIds = employees.map((e) => e.userId);

    const result = await this.prisma.user.aggregate({
      where: { id: { in: userIds } },
      _sum: { xp: true },
      _count: true,
    });

    return { totalXp: result._sum.xp || 0, employeeCount: result._count };
  }

  async getOrgLeaderboard(organizationId: string, limit: number = 50) {
    const employees = await this.prisma.employee.findMany({
      where: { organizationId },
      select: { userId: true },
    });
    const userIds = employees.map((e) => e.userId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        xp: true,
        streakCount: true,
        lastActiveAt: true,
      },
      orderBy: { xp: 'desc' },
      take: limit,
    });

    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      xp: u.xp,
      streakCount: u.streakCount,
      lastActiveAt: u.lastActiveAt,
    }));
  }

  async getDailyActivity(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [attempts, credentials, xpTransactions] = await Promise.all([
      this.prisma.complianceAssessmentAttempt.findMany({
        where: {
          userId,
          startedAt: { gte: startDate, lte: endDate },
        },
        select: { startedAt: true, completedAt: true },
      }),
      this.prisma.enterpriseCredential.findMany({
        where: {
          employee: { userId },
          issuedAt: { gte: startDate, lte: endDate },
        },
        select: { issuedAt: true },
      }),
      this.prisma.xpTransaction.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { createdAt: true },
      }),
    ]);

    const dayMap = new Map<string, number>();

    for (const a of attempts) {
      const day = a.startedAt.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
      if (a.completedAt) {
        const cDay = a.completedAt.toISOString().split('T')[0];
        dayMap.set(cDay, (dayMap.get(cDay) || 0) + 1);
      }
    }
    for (const c of credentials) {
      const day = c.issuedAt.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }
    for (const x of xpTransactions) {
      const day = x.createdAt.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }

    return Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));
  }

  async getLeaderboardUserPosition(organizationId: string, userId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { organizationId },
      select: { userId: true },
    });
    const userIds = employees.map((e) => e.userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    if (!user) return null;

    const rank = await this.prisma.user.count({
      where: {
        id: { in: userIds },
        xp: { gt: user.xp },
      },
    });

    return { rank: rank + 1, xp: user.xp };
  }
}
