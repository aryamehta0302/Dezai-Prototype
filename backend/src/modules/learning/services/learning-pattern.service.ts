import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface LearningPattern {
  mostActiveHour: number;
  mostActiveDay: string;
  averageSessionDurationMinutes: number;
  consistencyScore: number;
  weeklyActivity: { day: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  preferredContentType: string;
  patternSummary: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  streakHistory: { date: string; active: boolean }[];
}

@Injectable()
export class LearningPatternService {
  constructor(private prisma: PrismaService) {}

  async getLearningPatterns(userId: string): Promise<LearningPattern> {
    const progresses = await this.prisma.progress.findMany({
      where: { userId },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    });

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId },
      select: { startedAt: true, completedAt: true },
    });

    const timestamps = [
      ...progresses.map((p) => p.completedAt),
      ...attempts.map((a) => a.completedAt || a.startedAt),
    ].filter(Boolean) as Date[];

    if (timestamps.length === 0) {
      return {
        mostActiveHour: 0,
        mostActiveDay: 'Monday',
        averageSessionDurationMinutes: 0,
        consistencyScore: 0,
        weeklyActivity: [],
        hourlyDistribution: [],
        preferredContentType: 'lessons',
        patternSummary: 'Not enough activity data to detect patterns.',
      };
    }

    const dayMap: Record<string, number> = {};
    const hourMap: Record<number, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const ts of timestamps) {
      const day = dayNames[ts.getDay()];
      dayMap[day] = (dayMap[day] || 0) + 1;
      hourMap[ts.getHours()] = (hourMap[ts.getHours()] || 0) + 1;
    }

    const mostActiveHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0]?.[0]
      ? Number(Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0][0])
      : 0;

    const mostActiveDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

    const sessionDiffs: number[] = [];
    const sortedTimestamps = [...timestamps].sort((a, b) => a.getTime() - b.getTime());
    for (let i = 1; i < sortedTimestamps.length; i++) {
      const diff = (sortedTimestamps[i].getTime() - sortedTimestamps[i - 1].getTime()) / 60000;
      if (diff > 0 && diff < 120) {
        sessionDiffs.push(diff);
      }
    }
    const avgSession =
      sessionDiffs.length > 0
        ? Math.round(sessionDiffs.reduce((a, b) => a + b, 0) / sessionDiffs.length)
        : 0;

    const activeDays = Object.keys(dayMap).length;
    const totalDays = 7;
    const consistencyScore = Math.round((activeDays / totalDays) * 100);

    const weeklyActivity = dayNames.map((day) => ({
      day,
      count: dayMap[day] || 0,
    }));

    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourMap[i] || 0,
    }));

    const lessonCount = progresses.length;
    const assessmentCount = attempts.filter((a) => a.completedAt).length;
    const preferredContentType = lessonCount >= assessmentCount ? 'lessons' : 'assessments';

    const hourLabel =
      mostActiveHour >= 5 && mostActiveHour < 12
        ? 'morning'
        : mostActiveHour >= 12 && mostActiveHour < 17
          ? 'afternoon'
          : mostActiveHour >= 17 && mostActiveHour < 21
            ? 'evening'
            : 'night';

    const patternSummary = `You learn best in the ${hourLabel} (peak at ${mostActiveHour}:00). `
      + `Your most active day is ${mostActiveDay}. `
      + (consistencyScore > 50
        ? 'Great consistency across the week!'
        : 'Try to distribute your learning more evenly across days.');

    return {
      mostActiveHour,
      mostActiveDay,
      averageSessionDurationMinutes: avgSession,
      consistencyScore,
      weeklyActivity,
      hourlyDistribution,
      preferredContentType,
      patternSummary,
    };
  }

  async getStreakInfo(userId: string): Promise<StreakInfo> {
    const progresses = await this.prisma.progress.findMany({
      where: { userId },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    const allDates: string[] = [
      ...progresses.map((p) => p.completedAt.toISOString().split('T')[0]),
      ...attempts.map((a) => a.completedAt!.toISOString().split('T')[0]),
    ];

    if (allDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, streakHistory: [] };
    }

    const uniqueDates = [...new Set(allDates)].sort().reverse();
    const lastDate = uniqueDates[0];

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      const checkDate = new Date(uniqueDates[0]);
      for (let i = 0; i < uniqueDates.length; i++) {
        const expected = new Date(checkDate.getTime() - i * 86400000)
          .toISOString()
          .split('T')[0];
        if (uniqueDates[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 1;
    const sortedAsc = [...uniqueDates].sort();
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const streakHistory = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(twoWeeksAgo.getTime() + i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      streakHistory.push({
        date: dateStr,
        active: uniqueDates.includes(dateStr),
      });
    }

    return {
      currentStreak,
      longestStreak,
      lastActivityDate: lastDate ? new Date(lastDate) : null,
      streakHistory,
    };
  }
}
