import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface WeakTopic {
  topic: string;
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
}

export interface PredictionRule {
  rule: string;
  description: string;
  confidence: number;
}

export interface LearningRecommendation {
  type: 'REVIEW_MODULE' | 'PRACTICE_ASSESSMENT' | 'NEXT_LESSON' | 'WEAK_TOPIC' | 'SPEED_IMPROVEMENT';
  title: string;
  description: string;
  priority: number;
  moduleId?: string;
  assessmentId?: string;
  lessonId?: string;
}

@Injectable()
export class LearningRecommendationService {
  constructor(private prisma: PrismaService) {}

  async getWeakTopics(userId: string): Promise<WeakTopic[]> {
    const wrongAnswers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: { userId },
        isCorrect: false,
      },
      include: {
        question: {
          select: { category: true, tags: true, difficulty: true },
        },
      },
    });

    const correctAnswers = await this.prisma.attemptAnswer.findMany({
      where: {
        attempt: { userId },
        isCorrect: true,
      },
      include: {
        question: {
          select: { category: true, tags: true, difficulty: true },
        },
      },
    });

    const topicCounts: Record<string, { total: number; correct: number }> = {};

    const countAnswer = (answers: typeof wrongAnswers, isCorrect: boolean) => {
      for (const a of answers) {
        const topics = [...(a.question.tags || []), a.question.category || 'Uncategorized'].filter(Boolean);
        for (const topic of topics) {
          if (!topicCounts[topic]) topicCounts[topic] = { total: 0, correct: 0 };
          topicCounts[topic].total++;
          if (isCorrect) topicCounts[topic].correct++;
        }
      }
    };

    countAnswer(wrongAnswers, false);
    countAnswer(correctAnswers, true);

    return Object.entries(topicCounts)
      .filter(([_, v]) => v.total >= 2)
      .map(([topic, v]) => ({
        topic,
        accuracy: Math.round((v.correct / v.total) * 100),
        totalAttempts: v.total,
        correctAttempts: v.correct,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  async getDifficultyAnalysis(userId: string) {
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        attemptAnswers: {
          include: { question: { select: { difficulty: true } } },
        },
      },
    });

    const diffStats: Record<string, { total: number; correct: number }> = {
      EASY: { total: 0, correct: 0 },
      MEDIUM: { total: 0, correct: 0 },
      HARD: { total: 0, correct: 0 },
    };

    for (const a of attempts) {
      for (const ans of a.attemptAnswers) {
        const diff = ans.question.difficulty;
        if (diffStats[diff]) {
          diffStats[diff].total++;
          if (ans.isCorrect) diffStats[diff].correct++;
        }
      }
    }

    return Object.entries(diffStats).map(([difficulty, stats]) => ({
      difficulty,
      totalAttempts: stats.total,
      correctAttempts: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));
  }

  async getPredictionRules(userId: string): Promise<PredictionRule[]> {
    const rules: PredictionRule[] = [];

    const weakTopics = await this.getWeakTopics(userId);
    const difficultyAnalysis = await this.getDifficultyAnalysis(userId);
    const progressCount = await this.prisma.progress.count({ where: { userId } });
    const passedCount = await this.prisma.assessmentAttempt.count({
      where: { userId, passed: true },
    });

    if (weakTopics.length > 0) {
      rules.push({
        rule: 'weak_topic_review',
        description: `Student has ${weakTopics.length} weak topic(s) requiring review before new assessments.`,
        confidence: 85,
      });
    }

    const hardStats = difficultyAnalysis.find((d) => d.difficulty === 'HARD');
    if (hardStats && hardStats.accuracy < 50 && hardStats.totalAttempts >= 3) {
      rules.push({
        rule: 'difficulty_gap',
        description: 'Accuracy on HARD questions is below 50%. Recommend easier questions first.',
        confidence: 75,
      });
    }

    if (progressCount > 0 && passedCount === 0) {
      rules.push({
        rule: 'assessment_readiness',
        description: 'Student has completed lessons but never attempted an assessment. Encourage first attempt.',
        confidence: 90,
      });
    }

    if (rules.length === 0) {
      rules.push({
        rule: 'on_track',
        description: 'Student is progressing well. Continue with current pace.',
        confidence: 95,
      });
    }

    return rules;
  }

  async getRecommendations(userId: string): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];
    let priority = 1;

    const weakTopics = await this.getWeakTopics(userId);
    const veryWeak = weakTopics.filter((t) => t.accuracy < 50);

    if (veryWeak.length > 0) {
      recommendations.push({
        type: 'WEAK_TOPIC',
        title: 'Review Weak Areas',
        description: `Focus on improving: ${veryWeak.slice(0, 3).map((t) => t.topic).join(', ')}`,
        priority: priority++,
      });
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId, completedAt: null },
      include: { program: { select: { title: true } } },
    });

    if (enrollments.length > 0) {
      const latest = enrollments[0];
      const lastProgress = await this.prisma.progress.findFirst({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        include: {
          lesson: { select: { id: true, title: true, moduleId: true } },
        },
      });

      if (lastProgress) {
        recommendations.push({
          type: 'NEXT_LESSON',
          title: 'Continue Learning',
          description: `Pick up where you left off in "${latest.program.title}"`,
          priority: priority++,
          lessonId: lastProgress.lesson.id,
        });
      }
    }

    const completedModules = await this.getModulesReadyForAssessment(userId);
    for (const mod of completedModules) {
      recommendations.push({
        type: 'PRACTICE_ASSESSMENT',
        title: `Ready for Assessment`,
        description: `You completed all lessons in "${mod.title}" — take the assessment!`,
        priority: priority++,
        moduleId: mod.id,
        assessmentId: mod.assessmentId,
      });
    }

    const diffAnalysis = await this.getDifficultyAnalysis(userId);
    const hardStats = diffAnalysis.find((d) => d.difficulty === 'HARD');
    if (hardStats && hardStats.totalAttempts > 0 && hardStats.accuracy < 60) {
      recommendations.push({
        type: 'SPEED_IMPROVEMENT',
        title: 'Master Difficult Concepts',
        description: 'Review foundational topics before attempting HARD-level questions.',
        priority: priority++,
      });
    }

    return recommendations;
  }

  private async getModulesReadyForAssessment(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { programId: true },
    });
    const programIds = enrollments.map((e) => e.programId);

    const modules = await this.prisma.module.findMany({
      where: { track: { programId: { in: programIds } } },
      include: {
        lessons: { select: { id: true } },
        assessments: { select: { id: true, title: true } },
      },
    });

    const progresses = await this.prisma.progress.findMany({
      where: { userId },
      select: { lessonId: true },
    });
    const completedIds = new Set(progresses.map((p) => p.lessonId));

    const passedAssessments = await this.prisma.assessmentAttempt.findMany({
      where: { userId, passed: true },
      select: { assessmentId: true },
    });
    const passedIds = new Set(passedAssessments.map((a) => a.assessmentId));

    const ready: { id: string; title: string; assessmentId: string }[] = [];
    for (const mod of modules) {
      if (mod.lessons.length === 0) continue;
      const allLessonsDone = mod.lessons.every((l) => completedIds.has(l.id));
      if (allLessonsDone) {
        for (const ass of mod.assessments) {
          if (!passedIds.has(ass.id)) {
            ready.push({ id: mod.id, title: mod.title, assessmentId: ass.id });
          }
        }
      }
    }

    return ready;
  }
}
