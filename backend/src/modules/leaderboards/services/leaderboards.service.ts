import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  LeaderboardRange,
  StudentLeaderboardEntryDto,
  StudentLeaderboardResponseDto,
  UniversityLeaderboardEntryDto,
  UniversityLeaderboardResponseDto,
  ProgramLeaderboardEntryDto,
  ProgramLeaderboardResponseDto,
  LeaderboardWidgetEntryDto,
  StudentWidgetResponseDto,
  FacultyWidgetResponseDto,
} from '../dto/leaderboard.dto';

/**
 * LeaderboardsService
 *
 * Implements all leaderboard and widget business logic.
 *
 * Methods:
 *   1. getStudentLeaderboard    — ranked student list (weekly / monthly / all-time)
 *   2. getUniversityLeaderboard — ranked institution list by total XP
 *   3. getProgramLeaderboard    — ranked program list by total XP
 *   4. getStudentWidget         — compact top-N widget for student dashboard
 *   5. getFacultyWidget         — compact top-N widget for faculty dashboard
 *
 * Ranking Rules (CTO-finalized):
 *   - Weekly:   sum XpTransaction.amount WHERE createdAt >= (now - 7 days)
 *   - Monthly:  sum XpTransaction.amount WHERE createdAt >= (now - 30 days)
 *   - All-time: User.xp (running total stored on the User record)
 *   - streakCount = display only — NEVER used for ranking
 *
 * Tie-breaking (standard competition ranking):
 *   - Equal XP → equal rank
 *   - Next rank skips (1, 2, 2, 4 — NOT 1, 2, 2, 3)
 *
 * Limit rules:
 *   - Min: 1   (clamp below 1 → set to 1)
 *   - Max: 100 (clamp above 100 → set to 100)
 *
 * Active student definition: User.lastActiveAt >= (now - 30 days)
 *
 * Dezai Terminology:
 *   - Program     (not Course)
 *   - Institution (not College)
 *   - Enrollment  (not Registration)
 */
@Injectable()
export class LeaderboardsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Clamp limit to the allowed range [1, 100].
   */
  private clampLimit(limit: number): number {
    if (limit < 1) return 1;
    if (limit > 100) return 100;
    return limit;
  }

  /**
   * Compute the start date for a time range window.
   * Returns null for 'all' (no date filter needed).
   */
  private getRangeStartDate(range: LeaderboardRange): Date | null {
    if (range === 'weekly') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d;
    }
    if (range === 'monthly') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d;
    }
    return null; // 'all' — no date filter
  }

  /**
   * Assign standard competition ranks to a pre-sorted list.
   * Equal XP values receive the same rank; next rank skips.
   * Example: XP=[500, 500, 300, 200] → ranks=[1, 1, 3, 4]
   */
  private assignRanks(
    items: { xp: number }[],
  ): { xp: number; rank: number }[] {
    let currentRank = 1;
    return items.map((item, index) => {
      if (index > 0 && item.xp < items[index - 1].xp) {
        currentRank = index + 1;
      }
      return { ...item, rank: currentRank };
    });
  }

  /**
   * Calculate days between two dates. Returns null if endDate is null.
   * Used to compute fastest completion time from Enrollment data.
   */
  private daysBetween(start: Date, end: Date | null): number | null {
    if (!end) return null;
    const ms = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. STUDENT LEADERBOARD
  //    Rankings based on XP within the selected time range.
  //    All-time: uses User.xp directly (fast, no transaction aggregation needed).
  //    Weekly / Monthly: aggregates XpTransaction within the date window.
  // ─────────────────────────────────────────────────────────────────────────
  async getStudentLeaderboard(
    range: string = 'all',
    limit: number = 50,
  ): Promise<StudentLeaderboardResponseDto> {
    // Normalize and clamp inputs
    const safeRange: LeaderboardRange =
      range === 'weekly' || range === 'monthly' ? range : 'all';
    const safeLimit = this.clampLimit(limit);
    const startDate = this.getRangeStartDate(safeRange);

    let rankedEntries: StudentLeaderboardEntryDto[];

    if (safeRange === 'all') {
      // ── ALL-TIME: use User.xp directly ──────────────────────────────────
      const users = await this.prisma.user.findMany({
        where: { role: 'STUDENT' },
        orderBy: { xp: 'desc' },
        take: safeLimit,
        select: {
          id: true,
          name: true,
          xp: true,
          streakCount: true,
          enrollments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              program: {
                select: {
                  institution: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      const withRanks = this.assignRanks(users.map((u) => ({ xp: u.xp, _u: u })));

      rankedEntries = withRanks.map((item, index) => {
        const u = users[index];
        const institution =
          u.enrollments[0]?.program?.institution?.name ?? 'Independent';
        return {
          rank: item.rank,
          userId: u.id,
          name: u.name ?? 'Unknown',
          xp: u.xp,
          streakCount: u.streakCount,
          institution,
        };
      });
    } else {
      // ── WEEKLY / MONTHLY: aggregate XpTransaction within date window ─────
      const xpAggregates = await this.prisma.xpTransaction.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startDate! },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: safeLimit,
      });

      if (xpAggregates.length === 0) {
        return {
          range: safeRange,
          generatedAt: new Date(),
          total: 0,
          entries: [],
        };
      }

      // Fetch user details for the aggregated userIds
      const userIds = xpAggregates.map((a) => a.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds }, role: 'STUDENT' },
        select: {
          id: true,
          name: true,
          streakCount: true,
          enrollments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              program: {
                select: {
                  institution: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      // Build a lookup map for O(1) user access
      const userMap = new Map(users.map((u) => [u.id, u]));

      // Map aggregates to DTO — only include users with role=STUDENT
      const filtered = xpAggregates.filter((a) => userMap.has(a.userId));
      const withRanks = this.assignRanks(
        filtered.map((a) => ({ xp: a._sum.amount ?? 0 })),
      );

      rankedEntries = withRanks.map((item, index) => {
        const agg = filtered[index];
        const user = userMap.get(agg.userId);
        const institution =
          user?.enrollments[0]?.program?.institution?.name ?? 'Independent';
        return {
          rank: item.rank,
          userId: agg.userId,
          name: user?.name ?? 'Unknown',
          xp: agg._sum.amount ?? 0,
          streakCount: user?.streakCount ?? 0,
          institution,
        };
      });
    }

    return {
      range: safeRange,
      generatedAt: new Date(),
      total: rankedEntries.length,
      entries: rankedEntries,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. UNIVERSITY LEADERBOARD
  //    Rankings based on total XP of all students enrolled in each institution.
  //    Also returns: active students (30-day window), fastest completion (days).
  // ─────────────────────────────────────────────────────────────────────────
  async getUniversityLeaderboard(
    limit: number = 20,
  ): Promise<UniversityLeaderboardResponseDto> {
    const safeLimit = this.clampLimit(limit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all institutions with their programs, enrollments, and user XP
    const institutions = await this.prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        programs: {
          select: {
            enrollments: {
              select: {
                createdAt: true,
                completedAt: true,
                user: {
                  select: {
                    id: true,
                    xp: true,
                    lastActiveAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Compute metrics for each institution
    const computed = institutions.map((inst) => {
      // Flatten all enrollments across all programs in this institution
      const allEnrollments = inst.programs.flatMap((p) => p.enrollments);

      // Deduplicate users to avoid double-counting if enrolled in multiple programs
      const uniqueUsersMap = new Map<string, { xp: number; lastActiveAt: Date | null }>();
      for (const e of allEnrollments) {
        if (e.user) {
          uniqueUsersMap.set(e.user.id, {
            xp: e.user.xp ?? 0,
            lastActiveAt: e.user.lastActiveAt,
          });
        }
      }

      const uniqueUsersList = Array.from(uniqueUsersMap.values());

      // Total XP: sum of unique users' XP
      const totalXp = uniqueUsersList.reduce(
        (sum, u) => sum + u.xp,
        0,
      );

      // Active students: unique users active in last 30 days
      const activeStudentCount = uniqueUsersList.filter(
        (u) =>
          u.lastActiveAt &&
          u.lastActiveAt >= thirtyDaysAgo,
      ).length;

      // Fastest completion: minimum days from createdAt to completedAt
      const completionDays = allEnrollments
        .map((e) => this.daysBetween(e.createdAt, e.completedAt))
        .filter((d): d is number => d !== null);

      const fastestCompletionDays =
        completionDays.length > 0 ? Math.min(...completionDays) : null;

      return {
        institutionId: inst.id,
        institutionName: inst.name,
        totalXp,
        activeStudents: activeStudentCount,
        fastestCompletionDays,
      };
    });

    // Sort by totalXp DESC, then assign standard competition ranks
    computed.sort((a, b) => b.totalXp - a.totalXp);
    const withRanks = this.assignRanks(computed.map((c) => ({ xp: c.totalXp, _c: c })));

    const entries: UniversityLeaderboardEntryDto[] = withRanks
      .slice(0, safeLimit)
      .map((item, index) => ({
        rank: item.rank,
        ...computed[index],
      }));

    return {
      generatedAt: new Date(),
      total: entries.length,
      entries,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. PROGRAM LEADERBOARD
  //    Rankings based on total XP of all students enrolled in each program.
  //    Also returns: active students (30-day window), fastest completion (days).
  // ─────────────────────────────────────────────────────────────────────────
  async getProgramLeaderboard(
    limit: number = 20,
  ): Promise<ProgramLeaderboardResponseDto> {
    const safeLimit = this.clampLimit(limit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all programs with institution name, enrollments, and user XP
    const programs = await this.prisma.program.findMany({
      select: {
        id: true,
        title: true,
        institution: { select: { name: true } },
        enrollments: {
          select: {
            createdAt: true,
            completedAt: true,
            user: {
              select: {
                xp: true,
                lastActiveAt: true,
              },
            },
          },
        },
      },
    });

    // Compute metrics for each program
    const computed = programs.map((prog) => {
      const totalXp = prog.enrollments.reduce(
        (sum, e) => sum + (e.user.xp ?? 0),
        0,
      );

      const activeStudentCount = prog.enrollments.filter(
        (e) =>
          e.user.lastActiveAt &&
          e.user.lastActiveAt >= thirtyDaysAgo,
      ).length;

      const completionDays = prog.enrollments
        .map((e) => this.daysBetween(e.createdAt, e.completedAt))
        .filter((d): d is number => d !== null);

      const fastestCompletionDays =
        completionDays.length > 0 ? Math.min(...completionDays) : null;

      return {
        programId: prog.id,
        programTitle: prog.title,
        institutionName: prog.institution?.name ?? 'Unknown Institution',
        totalXp,
        activeStudents: activeStudentCount,
        fastestCompletionDays,
      };
    });

    // Sort by totalXp DESC, assign ranks, slice to limit
    computed.sort((a, b) => b.totalXp - a.totalXp);
    const withRanks = this.assignRanks(computed.map((c) => ({ xp: c.totalXp })));

    const entries: ProgramLeaderboardEntryDto[] = withRanks
      .slice(0, safeLimit)
      .map((item, index) => ({
        rank: item.rank,
        ...computed[index],
      }));

    return {
      generatedAt: new Date(),
      total: entries.length,
      entries,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. STUDENT WIDGET
  //    Compact top-N all-time student leaderboard for the student dashboard.
  //    Always all-time XP (no range filter for widgets).
  //    Marks the requesting user's entry with isCurrentUser=true.
  //    Returns the current user's rank even if they are outside the top-N.
  // ─────────────────────────────────────────────────────────────────────────
  async getStudentWidget(
    userId: string,
    limit: number = 5,
  ): Promise<StudentWidgetResponseDto> {
    const safeLimit = this.clampLimit(limit);

    // Fetch ALL students ranked by XP (need full list to find current user's rank)
    const allStudents = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { xp: 'desc' },
      select: { id: true, name: true, xp: true },
    });

    if (allStudents.length === 0) {
      return {
        currentUserRank: null,
        currentUserXp: 0,
        topStudents: [],
      };
    }

    // Assign ranks across the full list
    const withRanks = this.assignRanks(allStudents.map((s) => ({ xp: s.xp })));

    // Find current user's position in the full ranked list
    const currentUserIndex = allStudents.findIndex((s) => s.id === userId);
    const currentUserRank =
      currentUserIndex >= 0 ? withRanks[currentUserIndex].rank : null;
    const currentUserXp =
      currentUserIndex >= 0 ? allStudents[currentUserIndex].xp : 0;

    // Build top-N widget entries
    const topStudents: LeaderboardWidgetEntryDto[] = allStudents
      .slice(0, safeLimit)
      .map((student, index) => ({
        rank: withRanks[index].rank,
        userId: student.id,
        name: student.name ?? 'Unknown',
        xp: student.xp,
        isCurrentUser: student.id === userId,
      }));

    return {
      currentUserRank,
      currentUserXp,
      topStudents,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. FACULTY WIDGET
  //    Compact top-N student leaderboard scoped to the faculty's most recent program.
  //    Accepts optional programId to pin to a specific program.
  //    Only accessible by FACULTY, UNIVERSITY_ADMIN, and DEZAI_ADMIN roles.
  // ─────────────────────────────────────────────────────────────────────────
  async getFacultyWidget(
    userId: string,
    limit: number = 5,
    programId?: string,
  ): Promise<FacultyWidgetResponseDto> {
    const safeLimit = this.clampLimit(limit);

    // Step 1: Resolve FacultyMember from userId
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { userId },
    });

    if (!facultyMember) {
      throw new NotFoundException(
        'Faculty profile not found for this user. Please complete onboarding first.',
      );
    }

    // Step 2: Resolve the target program
    // If programId is given, use it. Otherwise, use the most recently created program.
    let targetProgram: { id: string; title: string } | null = null;

    if (programId) {
      targetProgram = await this.prisma.program.findFirst({
        where: { id: programId, facultyId: facultyMember.id },
        select: { id: true, title: true },
      });
    } else {
      targetProgram = await this.prisma.program.findFirst({
        where: { facultyId: facultyMember.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true },
      });
    }

    // Step 3: If no program exists for this faculty, return empty widget
    if (!targetProgram) {
      return {
        programId: null,
        programTitle: null,
        topStudents: [],
      };
    }

    // Step 4: Fetch enrolled students sorted by XP DESC
    const enrollments = await this.prisma.enrollment.findMany({
      where: { programId: targetProgram.id },
      orderBy: { user: { xp: 'desc' } },
      take: safeLimit,
      select: {
        user: {
          select: { id: true, name: true, xp: true },
        },
      },
    });

    // Step 5: Assign ranks and build widget entries
    const withRanks = this.assignRanks(
      enrollments.map((e) => ({ xp: e.user.xp })),
    );

    const topStudents: LeaderboardWidgetEntryDto[] = enrollments.map(
      (enrollment, index) => ({
        rank: withRanks[index].rank,
        userId: enrollment.user.id,
        name: enrollment.user.name ?? 'Unknown',
        xp: enrollment.user.xp,
        isCurrentUser: false, // Faculty widget shows students — never the faculty themselves
      }),
    );

    return {
      programId: targetProgram.id,
      programTitle: targetProgram.title,
      topStudents,
    };
  }
}
