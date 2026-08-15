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
import { PromptBuilderService } from './prompt-builder.service';
import type {
  LessonSummaryDto,
  MentorRecommendationDto,
  ModuleSummaryDto,
  RemediationPlanDto,
  StudyNotesDto,
} from '../dto/intelligence.dto';

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
    private readonly promptBuilderService: PromptBuilderService,
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
        attemptAnswers: {
          include: {
            question: { select: { category: true, difficulty: true } },
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
    const [weakTopics, incorrectQuestions] = await Promise.all([
      this.weakTopicDetectionService.getStudentWeakTopics(
        userId,
        attempt.assessmentId,
      ),
      this.weakTopicDetectionService.getIncorrectQuestionAnalysis(
        userId,
        attempt.assessmentId,
      ),
    ]);
    const attemptsUsed = await this.prisma.assessmentAttempt.count({
      where: {
        userId,
        assessmentId: attempt.assessmentId,
        completedAt: { not: null },
      },
    });
    const currentPerformance = new Map<
      string,
      { total: number; wrong: number }
    >();
    for (const answer of attempt.attemptAnswers) {
      const category = answer.question.category ?? 'Uncategorised';
      const bucket = currentPerformance.get(category) ?? { total: 0, wrong: 0 };
      bucket.total++;
      if (!answer.isCorrect) bucket.wrong++;
      currentPerformance.set(category, bucket);
    }
    const weakOnly = weakTopics
      .map((topic) => {
        const current = currentPerformance.get(topic.category);
        const currentWrongRate = current?.total
          ? current.wrong / current.total
          : topic.wrongRate;
        const confidenceAdjustedHistory =
          (topic.totalWrong + 1) / (topic.totalAnswered + 2);
        return {
          ...topic,
          priorityScore:
            currentWrongRate * 0.65 + confidenceAdjustedHistory * 0.35,
          missedInCurrentAttempt: (current?.wrong ?? 0) > 0,
        };
      })
      .filter(
        (topic) =>
          topic.priorityScore >= 0.4 &&
          (topic.missedInCurrentAttempt || topic.totalWrong >= 2),
      )
      .sort((a, b) => b.priorityScore - a.priorityScore);
    const recommendedLessons = this.matchLessonsToWeakTopics(
      attempt.assessment.module.lessons,
      weakOnly.map((topic) => topic.category),
    );
    const studyPlan = this.buildStudyPlan(
      weakOnly,
      recommendedLessons,
    );
    const misconceptionHints = incorrectQuestions
      .slice(0, 3)
      .map((question) => question.questionText)
      .join('; ');
    const mentorAdvice = await this.generateMentorText(
      `Score: ${result.percentage}% on "${result.assessmentTitle}". Priority weak topics: ${weakOnly.map((topic) => `${topic.category} (${Math.round(topic.priorityScore * 100)}% risk)`).join(', ') || 'no repeated topic'}. Frequently missed questions: ${misconceptionHints || 'not enough evidence'}.`,
      'Create exactly 3 concise remediation bullets: what to relearn, how to practice, and the evidence needed before retaking. Never reveal answer keys.',
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
        canRetake: attemptsUsed < attempt.assessment.maxAttempts,
        attemptsRemaining: Math.max(
          0,
          attempt.assessment.maxAttempts - attemptsUsed,
        ),
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
    const digest = this.promptBuilderService.buildContentDigest(
      lesson.content,
      `${lesson.title} ${keyConcepts.join(' ')}`,
    );
    const summary = await this.generateMentorText(
      `Title: ${lesson.title}\nKey concepts: ${keyConcepts.join(', ')}\nSelected lesson material:\n${digest}`,
      'Write a cohesive 3-sentence lesson summary: core idea, how the concepts connect, and practical or assessment relevance. Be specific and do not invent details.',
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
    const moduleOutline = lessonSummaries
      .map(
        (lesson) =>
          `${lesson.title}: ${lesson.keyConcepts.slice(0, 3).join(', ')}`,
      )
      .join('\n');
    const overview = await this.generateMentorText(
      `Module: ${module.title}\nLesson outline:\n${moduleOutline}`,
      'Write a module overview under 120 words that explains progression across lessons and what the student should be able to connect for assessment. Use only the outline.',
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
    const concepts = this.extractKeyConcepts(lesson.content, lesson.title);
    const digest = this.promptBuilderService.buildContentDigest(
      lesson.content,
      `${lesson.title} ${concepts.join(' ')}`,
      3_000,
    );
    const notes = await this.generateMentorText(
      `Title: ${lesson.title}\nConcepts: ${concepts.join(', ')}\nSelected lesson material:\n${digest}`,
      'Create markdown study notes using exactly these sections: Overview, Key Concepts, Important Details, Example/Application, and Self-Check (3 questions). Use concise bullets and only supplied material.',
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
    const topics = weakTopics.map((topic) => ({
      label: topic,
      words: this.topicWords(topic),
    }));
    const matches = lessons
      .map((lesson) => {
        const title = lesson.title.toLowerCase();
        const headings = this.extractKeyConcepts(
          lesson.content,
          lesson.title,
        )
          .join(' ')
          .toLowerCase();
        const content = lesson.content.toLowerCase();
        const matchedTopics = topics.filter(({ label, words }) => {
          const normalizedLabel = label.toLowerCase();
          return (
            title.includes(normalizedLabel) ||
            headings.includes(normalizedLabel) ||
            words.filter(
              (word) =>
                title.includes(word) ||
                headings.includes(word) ||
                content.includes(word),
            ).length >= Math.max(1, Math.ceil(words.length / 2))
          );
        });
        const score = matchedTopics.reduce(
          (total, topic) =>
            total +
            (title.includes(topic.label.toLowerCase()) ? 6 : 0) +
            (headings.includes(topic.label.toLowerCase()) ? 4 : 0) +
            topic.words.filter((word) => title.includes(word)).length * 2 +
            topic.words.filter((word) => headings.includes(word)).length,
          0,
        );
        return {
          lesson,
          matchedTopics,
          score,
        };
      })
      .filter(({ matchedTopics }) => matchedTopics.length > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ lesson, matchedTopics }) => ({
        lessonId: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        reason: `Targets: ${matchedTopics.map((topic) => topic.label).join(', ')}.`,
      }));

    if (matches.length > 0) return matches.slice(0, 5);

    return lessons.slice(0, 3).map((lesson) => ({
      lessonId: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      reason: 'Review this core module lesson before retaking the assessment.',
    }));
  }

  private buildStudyPlan(
    weakTopics: { category: string; wrongRate: number; difficulty: string }[],
    lessons: { title: string }[],
  ) {
    const topicLabels = weakTopics.map((topic) => topic.category);
    const severeTopics = weakTopics
      .filter((topic) => topic.wrongRate >= 0.67)
      .map((topic) => topic.category);
    const lessonTitles = lessons.map((lesson) => lesson.title);
    return [
      {
        day: 1,
        title: 'Diagnose and Review',
        tasks: [
          `Prioritize: ${topicLabels.join(', ') || 'incorrect answers from the attempt'}.`,
          severeTopics.length > 0
            ? `Start with high-risk topics: ${severeTopics.join(', ')}.`
            : 'Write one-sentence explanations for each missed question.',
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
    const takeaways = this.extractTakeaways(content).slice(0, 2);
    return takeaways.length > 0
      ? `${title} focuses on ${takeaways.join('. ')}.`
      : `${title} introduces the main concepts and examples students should review before moving ahead.`;
  }

  private fallbackStudyNotes(content: string, title: string): string {
    const concepts = this.extractKeyConcepts(content, title);
    const takeaways = this.extractTakeaways(content);
    return [
      `# ${title}`,
      '',
      '## Overview',
      this.fallbackSummary(content, title),
      '',
      '## Key Concepts',
      ...concepts.map((concept) => `- ${concept}`),
      '',
      '## Important Details',
      ...(takeaways.length > 0
        ? takeaways.map((takeaway) => `- ${takeaway}`)
        : ['- Review the lesson content and note the core examples.']),
      '',
      '## Example/Application',
      '- Connect the main concept to one example from the lesson.',
      '',
      '## Self-Check',
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

  private topicWords(value: string): string[] {
    return (
      value
        .toLowerCase()
        .match(/[a-z0-9]{3,}/g)
        ?.filter((word) => !['and', 'the', 'for', 'with'].includes(word)) ?? []
    );
  }
}
