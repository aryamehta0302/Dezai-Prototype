import { IsBoolean, IsOptional } from 'class-validator';

export interface MentorRecommendationDto {
  id: string;
  source: 'LEARNING' | 'ASSESSMENT';
  type: string;
  title: string;
  description: string;
  rationale: string;
  priority: number;
  programId?: string;
  moduleId?: string;
  assessmentId?: string;
  lessonId?: string;
  actionLabel?: string;
}

export interface RemediationWeakTopicDto {
  category: string;
  wrongRate: number;
  totalAnswered: number;
  totalWrong: number;
  difficulty: string;
}

export interface RemediationLessonDto {
  lessonId: string;
  title: string;
  moduleId: string;
  reason: string;
}

export interface StudyPlanStepDto {
  day: number;
  title: string;
  tasks: string[];
}

export interface RetakeGuidanceDto {
  canRetake: boolean;
  attemptsRemaining: number;
  recommendedBeforeRetake: string[];
}

export interface RemediationPlanDto {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  percentage: number;
  passed: boolean;
  weakTopics: RemediationWeakTopicDto[];
  recommendedLessons: RemediationLessonDto[];
  studyPlan: StudyPlanStepDto[];
  retakeGuidance: RetakeGuidanceDto;
  mentorAdvice: string;
}

export interface LessonSummaryDto {
  lessonId: string;
  title: string;
  summary: string;
  keyConcepts: string[];
  takeaways: string[];
}

export interface ModuleSummaryDto {
  moduleId: string;
  title: string;
  overview: string;
  lessonSummaries: LessonSummaryDto[];
  assessmentReadiness: {
    hasAssessment: boolean;
    assessmentIds: string[];
    readinessChecklist: string[];
  };
}

export class GenerateStudyNotesDto {
  @IsBoolean()
  @IsOptional()
  saveToNotes?: boolean;
}

export interface StudyNotesDto {
  lessonId: string;
  title: string;
  notes: string;
  savedToNotes: boolean;
}
