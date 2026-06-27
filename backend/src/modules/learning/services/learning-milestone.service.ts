import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface Milestone {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress: number;
  target: number;
  current: number;
}

@Injectable()
export class LearningMilestoneService {
  constructor(private prisma: PrismaService) {}

  async getMilestones(userId: string): Promise<Milestone[]> {
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, streakCount: true },
    });

    const [allProgress, allPassedAssessments, allEnrollments] = await Promise.all([
      this.prisma.progress.findMany({
        where: { userId },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.assessmentAttempt.findMany({
        where: { userId, passed: true },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.enrollment.findMany({
        where: { userId },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
    ]);

    const sortedLessonDates = allProgress.map((p) => p.completedAt).filter((d): d is Date => d !== null);
    const sortedAssessmentDates = allPassedAssessments.map((a) => a.completedAt).filter((d): d is Date => d !== null);
    const sortedProgramDates = allEnrollments.map((e) => e.completedAt).filter((d): d is Date => d !== null);

    const progressCount = sortedLessonDates.length;
    const passedAssessments = sortedAssessmentDates.length;
    const completedPrograms = sortedProgramDates.length;
    const moduleCompletions = await this.getModuleCompletionCount(userId);

    const xp = student?.xp ?? 0;
    const streak = student?.streakCount ?? 0;

    const milestoneDefs: Omit<Milestone, 'current' | 'progress' | 'isUnlocked'>[] = [
      { id: 'first-lesson', type: 'LESSON', title: 'First Step', description: 'Complete your first lesson', icon: 'BookOpen', target: 1 },
      { id: 'ten-lessons', type: 'LESSON', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: 'BookOpen', target: 10 },
      { id: 'fifty-lessons', type: 'LESSON', title: 'Knowledge Seeker', description: 'Complete 50 lessons', icon: 'Library', target: 50 },
      { id: 'first-assessment', type: 'ASSESSMENT', title: 'Test Taker', description: 'Pass your first assessment', icon: 'ClipboardCheck', target: 1 },
      { id: 'five-assessments', type: 'ASSESSMENT', title: 'Assessment Ace', description: 'Pass 5 assessments', icon: 'Award', target: 5 },
      { id: 'first-program', type: 'PROGRAM', title: 'Program Graduate', description: 'Complete your first program', icon: 'GraduationCap', target: 1 },
      { id: 'three-programs', type: 'PROGRAM', title: 'Multi-Program Achiever', description: 'Complete 3 programs', icon: 'Trophy', target: 3 },
      { id: 'module-master', type: 'MODULE', title: 'Module Master', description: 'Complete all lessons in 5 modules', icon: 'Layers', target: 5 },
      { id: 'streak-3', type: 'STREAK', title: 'Consistency is Key', description: 'Maintain a 3-day streak', icon: 'Flame', target: 3 },
      { id: 'streak-7', type: 'STREAK', title: 'Unstoppable', description: 'Maintain a 7-day streak', icon: 'Zap', target: 7 },
      { id: 'streak-30', type: 'STREAK', title: 'Monthly Warrior', description: 'Maintain a 30-day streak', icon: 'Flame', target: 30 },
      { id: 'xp-100', type: 'XP', title: 'Century', description: 'Earn 100 XP', icon: 'Star', target: 100 },
      { id: 'xp-500', type: 'XP', title: 'Rising Star', description: 'Earn 500 XP', icon: 'Star', target: 500 },
      { id: 'xp-1000', type: 'XP', title: 'Four-Figure Club', description: 'Earn 1,000 XP', icon: 'Trophy', target: 1000 },
      { id: 'xp-5000', type: 'XP', title: 'Power Learner', description: 'Earn 5,000 XP', icon: 'Crown', target: 5000 },
    ];

    return milestoneDefs.map((def) => {
      let current = 0;
      let unlockedAt: Date | undefined;

      switch (def.type) {
        case 'LESSON':
          current = sortedLessonDates.length;
          if (current >= def.target) {
            unlockedAt = sortedLessonDates[def.target - 1];
          }
          break;
        case 'ASSESSMENT':
          current = sortedAssessmentDates.length;
          if (current >= def.target) {
            unlockedAt = sortedAssessmentDates[def.target - 1];
          }
          break;
        case 'PROGRAM':
          current = sortedProgramDates.length;
          if (current >= def.target) {
            unlockedAt = sortedProgramDates[def.target - 1];
          }
          break;
        case 'MODULE':
          current = moduleCompletions;
          break;
        case 'STREAK':
          current = streak;
          break;
        case 'XP':
          current = xp;
          break;
      }

      const isUnlocked = current >= def.target;
      const progress = Math.min(100, Math.round((current / def.target) * 100));

      return {
        ...def,
        current,
        progress,
        isUnlocked,
        unlockedAt: isUnlocked ? (unlockedAt ?? undefined) : undefined,
      };
    });
  }

  private async getModuleCompletionCount(userId: string): Promise<number> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { programId: true },
    });

    if (enrollments.length === 0) return 0;

    const programIds = enrollments.map((e) => e.programId);

    const modules = await this.prisma.module.findMany({
      where: { track: { programId: { in: programIds } } },
      include: { lessons: { select: { id: true } } },
    });

    const progresses = await this.prisma.progress.findMany({
      where: { userId },
      select: { lessonId: true },
    });
    const completedIds = new Set(progresses.map((p) => p.lessonId));

    let count = 0;
    for (const mod of modules) {
      if (mod.lessons.length === 0) continue;
      const allDone = mod.lessons.every((l) => completedIds.has(l.id));
      if (allDone) count++;
    }

    return count;
  }
}
