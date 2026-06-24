import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LearningRecommendationService } from '../../learning/services/learning-recommendation.service';
import { LearningService } from '../../learning/services/learning.service';
import { RecommendationService } from '../../assessments/services/recommendation.service';
import { AttemptService } from '../../assessments/services/attempt.service';
import { WeakTopicDetectionService } from '../../assessments/services/weak-topic-detection.service';
import { AIProviderService } from './ai-provider.service';
import type {
  LessonSummaryDto,
  MentorRecommendationDto,
  ModuleSummaryDto,
  RemediationPlanDto,
  StudyNotesDto,
} from '../dto/intelligence.dto';

const MAX_ATTEMPTS = 3;

@Injectable()
export class MentorIntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learningRecommendationService: LearningRecommendationService,
    private readonly assessmentRecommendationService: RecommendationService,
    private readonly learningService: LearningService,
    private readonly attemptService: AttemptService,
    private readonly weakTopicDetectionService: WeakTopicDetectionService,
    private readonly aiProviderService: AIProviderService,
  ) {}

  async getRecommendations(
    userId: string,
  ): Promise<MentorRecommendationDto[]> {
    const [learningRecommendations, continueLearning, readyAssessments] =
      await Promise.all([
        this.learningRecommendationService.getRecommendations(userId),
        this.assessmentRecommendationService.getContinueLearning(userId),
        this.assessmentRecommendationService.getRecommendedAssessments(userId),
      ]);

    const recommendations: MentorRecommendationDto[] =
      learningRecommendations.map((rec, index) => ({
        id: `learning-${index}-${rec.type}`,
        source: 'LEARNING',
        type: rec.type,
        title: rec.title,
        description: rec.description,
        rationale: this.learningRationale(rec.type),
        priority: rec.priority,
        moduleId: rec.moduleId,
        assessmentId: rec.assessmentId,
        lessonId: rec.lessonId,
        actionLabel: this.actionForRecommendation(rec.type),
      }));

    const continueLearningData = continueLearning as {
      success?: boolean;
      completed?: boolean;
      programId?: string;
      programTitle?: string;
      moduleId?: string;
      moduleTitle?: string;
      firstIncompleteLesson?: { id: string; title: string };
    };

    if (continueLearningData.success && continueLearningData.programId) {
      recommendations.push({
        id: 'assessment-continue-learning',
        source: 'ASSESSMENT',
        type: continueLearningData.completed
          ? 'PROGRAM_COMPLETE'
          : 'CONTINUE_LEARNING',
        title: continueLearningData.completed
          ? 'Program Complete'
          : 'Continue Learning',
        description: continueLearningData.completed
          ? `You have completed ${continueLearningData.programTitle ?? 'this program'}.`
          : `Continue with ${continueLearningData.moduleTitle ?? 'your next module'}.`,
        rationale: continueLearningData.completed
          ? 'All lessons in this program are complete, so the next best step is credential or assessment review.'
          : 'This is the next incomplete module based on your enrolled program order and lesson progress.',
        priority: 1,
        programId: continueLearningData.programId,
        moduleId: continueLearningData.moduleId,
        lessonId: continueLearningData.firstIncompleteLesson?.id,
        actionLabel: continueLearningData.completed ? 'Review progress' : 'Start lesson',
      });
    }

    for (const assessment of readyAssessments.assessments ?? []) {
      recommendations.push({
        id: `assessment-ready-${assessment.assessmentId}`,
        source: 'ASSESSMENT',
        type: 'READY_ASSESSMENT',
        title: 'Assessment Ready',
        description: `${assessment.assessmentTitle} is ready after completing ${assessment.moduleTitle}.`,
        rationale:
          'You have completed every lesson in this module and have not passed this assessment yet.',
        priority: 2,
        moduleId: assessment.moduleId,
        assessmentId: assessment.assessmentId,
        actionLabel: 'Take assessment',
      });
    }

    return recommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 12);
  }

  async generateRemediationPlan(
    userId: string,
    attemptId: string,
  ): Promise<RemediationPlanDto> {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            module: {
              include: {
                lessons: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only remediate your own attempts');
    }
    if (!attempt.completedAt) {
      throw new NotFoundException('Attempt is not completed yet');
    }

    const result = await this.attemptService.getAttemptResult(
      userId,
      attemptId,
    );
    const weakTopics =
      await this.weakTopicDetectionService.getStudentWeakTopics(
        userId,
        attempt.assessmentId,
      );
    const attemptsUsed = await this.prisma.assessmentAttempt.count({
      where: { userId, assessmentId: attempt.assessmentId },
    });
    const weakOnly = weakTopics.filter((topic) => topic.isWeak);
    const recommendedLessons = this.matchLessonsToWeakTopics(
      attempt.assessment.module.lessons,
      weakOnly.map((topic) => topic.category),
    );
    const studyPlan = this.buildStudyPlan(
      weakOnly.map((topic) => topic.category),
      recommendedLessons.map((lesson) => lesson.title),
    );
    const mentorAdvice = await this.generateMentorText(
      `Create concise remediation advice for a student who scored ${result.percentage}% on "${result.assessmentTitle}". Weak topics: ${weakOnly.map((topic) => topic.category).join(', ') || 'none detected'}.`,
      'You are an encouraging AI Mentor. Give practical remediation advice in 3 short bullet points.',
      this.fallbackRemediationAdvice(result.percentage, weakOnly.length),
    );

    return {
      attemptId,
      assessmentId: attempt.assessmentId,
      assessmentTitle: result.assessmentTitle,
      score: result.score,
      percentage: result.percentage,
      passed: result.passed,
      weakTopics: weakOnly.map((topic) => ({
        category: topic.category,
        wrongRate: topic.wrongRate,
        totalAnswered: topic.totalAnswered,
        totalWrong: topic.totalWrong,
        difficulty: topic.difficulty,
      })),
      recommendedLessons,
      studyPlan,
      retakeGuidance: {
        canRetake: attemptsUsed < MAX_ATTEMPTS,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attemptsUsed),
        recommendedBeforeRetake: [
          'Review every incorrect answer and explain the correct option in your own words.',
          'Complete the recommended lessons before starting another timed attempt.',
          'Retake only after you can answer the weak-topic checks without notes.',
        ],
      },
      mentorAdvice,
    };
  }

  async generateLessonSummary(lessonId: string): Promise<LessonSummaryDto> {
    const lesson = await this.learningService.getLesson(lessonId);
    const keyConcepts = this.extractKeyConcepts(lesson.content, lesson.title);
    const takeaways = this.extractTakeaways(lesson.content);
    const summary = await this.generateMentorText(
      `Summarize this lesson in 3 concise sentences.\n\nTitle: ${lesson.title}\n\nContent:\n${this.truncate(lesson.content, 4000)}`,
      'You summarize lessons for students. Be direct, specific, and study-focused.',
      this.fallbackSummary(lesson.content, lesson.title),
    );

    return {
      lessonId: lesson.id,
      title: lesson.title,
      summary,
      keyConcepts,
      takeaways,
    };
  }

  async generateModuleSummary(moduleId: string): Promise<ModuleSummaryDto> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        assessments: { select: { id: true, title: true, passingScore: true } },
      },
    });

    if (!module) throw new NotFoundException('Module not found');

    const lessonSummaries = module.lessons.map((lesson) => ({
      lessonId: lesson.id,
      title: lesson.title,
      summary: this.fallbackSummary(lesson.content, lesson.title),
      keyConcepts: this.extractKeyConcepts(lesson.content, lesson.title),
      takeaways: this.extractTakeaways(lesson.content).slice(0, 2),
    }));
    const overview = await this.generateMentorText(
      `Write a concise module overview for "${module.title}" using these lessons: ${module.lessons.map((lesson) => lesson.title).join(', ')}.`,
      'You summarize modules for assessment preparation. Keep it under 120 words.',
      `${module.title} brings together ${module.lessons.length} lesson(s): ${module.lessons.map((lesson) => lesson.title).join(', ')}.`,
    );

    return {
      moduleId: module.id,
      title: module.title,
      overview,
      lessonSummaries,
      assessmentReadiness: {
        hasAssessment: module.assessments.length > 0,
        assessmentIds: module.assessments.map((assessment) => assessment.id),
        readinessChecklist: [
          'You can explain the key idea from each lesson without reading the lesson text.',
          'You can connect weak topics to the relevant lesson examples.',
          module.assessments.length > 0
            ? `You are ready to attempt ${module.assessments[0].title} when practice accuracy is near ${module.assessments[0].passingScore}%.`
            : 'No linked assessment was found for this module.',
        ],
      },
    };
  }

  async generateStudyNotes(
    userId: string,
    lessonId: string,
    saveToNotes = false,
  ): Promise<StudyNotesDto> {
    const lesson = await this.learningService.getLesson(lessonId);
    const notes = await this.generateMentorText(
      `Create structured study notes for this lesson with headings, bullets, definitions, and quick review questions.\n\nTitle: ${lesson.title}\n\nContent:\n${this.truncate(lesson.content, 5000)}`,
      'You create clean, structured study notes for students. Use markdown.',
      this.fallbackStudyNotes(lesson.content, lesson.title),
    );

    if (saveToNotes) {
      await this.learningService.upsertNote(userId, lessonId, notes);
    }

    return {
      lessonId: lesson.id,
      title: lesson.title,
      notes,
      savedToNotes: saveToNotes,
    };
  }

  private async generateMentorText(
    userMessage: string,
    systemPrompt: string,
    fallback: string,
  ): Promise<string> {
    try {
      const response = await this.aiProviderService.generateResponse(
        userMessage,
        systemPrompt,
      );
      return response?.trim() || fallback;
    } catch {
      return fallback;
    }
  }

  private learningRationale(type: string): string {
    const rationales: Record<string, string> = {
      WEAK_TOPIC:
        'Your recent assessment answers show repeated misses in these topics.',
      NEXT_LESSON:
        'This follows your latest progress and keeps your learning sequence moving.',
      PRACTICE_ASSESSMENT:
        'You have completed the module lessons and are ready to validate understanding.',
      SPEED_IMPROVEMENT:
        'Your hard-question performance suggests reviewing foundations before increasing difficulty.',
      REVIEW_MODULE:
        'Reviewing this module should strengthen the concepts behind recent mistakes.',
    };
    return rationales[type] ?? 'This recommendation is based on your progress and assessment history.';
  }

  private actionForRecommendation(type: string): string {
    const actions: Record<string, string> = {
      WEAK_TOPIC: 'Review topics',
      NEXT_LESSON: 'Continue lesson',
      PRACTICE_ASSESSMENT: 'Start assessment',
      SPEED_IMPROVEMENT: 'Review foundations',
      REVIEW_MODULE: 'Review module',
    };
    return actions[type] ?? 'Open';
  }

  private matchLessonsToWeakTopics(
    lessons: { id: string; moduleId: string; title: string; content: string }[],
    weakTopics: string[],
  ) {
    const topics = weakTopics.map((topic) => topic.toLowerCase());
    const matches = lessons
      .filter((lesson) => {
        const searchable = `${lesson.title} ${lesson.content}`.toLowerCase();
        return topics.some((topic) => searchable.includes(topic));
      })
      .map((lesson) => ({
        lessonId: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        reason: 'This lesson appears to cover one or more weak topics from the assessment.',
      }));

    if (matches.length > 0) return matches.slice(0, 5);

    return lessons.slice(0, 3).map((lesson) => ({
      lessonId: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      reason: 'Review this core module lesson before retaking the assessment.',
    }));
  }

  private buildStudyPlan(weakTopics: string[], lessonTitles: string[]) {
    return [
      {
        day: 1,
        title: 'Diagnose and Review',
        tasks: [
          `Review weak topics: ${weakTopics.join(', ') || 'incorrect answers from the attempt'}.`,
          'Write one-sentence explanations for each missed question.',
        ],
      },
      {
        day: 2,
        title: 'Relearn Target Lessons',
        tasks: [
          `Study: ${lessonTitles.join(', ') || 'the module lessons linked to this assessment'}.`,
          'Create examples that differ from the lesson examples.',
        ],
      },
      {
        day: 3,
        title: 'Practice and Retake',
        tasks: [
          'Answer review questions without notes.',
          'Retake only after you can explain mistakes and correct answers confidently.',
        ],
      },
    ];
  }

  private extractKeyConcepts(content: string, title: string): string[] {
    const headings = [...content.matchAll(/^#{1,4}\s+(.+)$/gm)]
      .map((match) => match[1].replace(/[*_`]/g, '').trim())
      .filter(Boolean);
    const concepts = headings.length > 0 ? headings : [title];
    return [...new Set(concepts)].slice(0, 6);
  }

  private extractTakeaways(content: string): string[] {
    const sentences = content
      .replace(/[#*_`>\-[\]()]/g, ' ')
      .split(/[.!?]\s+/)
      .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
      .filter((sentence) => sentence.length > 45);
    return sentences.slice(0, 4);
  }

  private fallbackSummary(content: string, title: string): string {
    const takeaway = this.extractTakeaways(content)[0];
    return takeaway
      ? `${title}: ${takeaway}.`
      : `${title} introduces the main concepts and examples students should review before moving ahead.`;
  }

  private fallbackStudyNotes(content: string, title: string): string {
    const concepts = this.extractKeyConcepts(content, title);
    const takeaways = this.extractTakeaways(content);
    return [
      `# ${title}`,
      '',
      '## Key Concepts',
      ...concepts.map((concept) => `- ${concept}`),
      '',
      '## Takeaways',
      ...(takeaways.length > 0
        ? takeaways.map((takeaway) => `- ${takeaway}`)
        : ['- Review the lesson content and note the core examples.']),
      '',
      '## Quick Review',
      '- What is the main idea of this lesson?',
      '- Which example best explains the concept?',
      '- What would you review before an assessment?',
    ].join('\n');
  }

  private fallbackRemediationAdvice(
    percentage: number,
    weakTopicCount: number,
  ): string {
    return [
      `You scored ${percentage}%, so focus first on accuracy before speed.`,
      weakTopicCount > 0
        ? 'Start with the weakest categories and connect each mistake to a lesson section.'
        : 'Review the incorrect answers even though no repeated weak topic was detected.',
      'Do one short review pass, then practice without notes before retaking.',
    ].join('\n');
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength
      ? `${value.slice(0, maxLength)}...`
      : value;
  }
}
