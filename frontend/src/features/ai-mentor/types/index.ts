/**
 * AI Mentor Types
 */
export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  activeProgramId?: string;
  activeModuleId?: string;
  activeLessonId?: string;
  createdAt: string;
  updatedAt?: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'USER' | 'MENTOR';
  content: string;
  createdAt: string;
}

export interface CreateSessionRequest {
  activeProgramId?: string;
  activeModuleId?: string;
  activeLessonId?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
}

export interface UpdateContextRequest {
  activeProgramId?: string;
  activeModuleId?: string;
  activeLessonId?: string;
}

export interface ChatSessionsResponse {
  success: boolean;
  sessions: ChatSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChatSessionResponse {
  success: boolean;
  session: ChatSession;
}

export interface SendMessageResponse {
  success: boolean;
  userMessage: ChatMessage;
  mentorMessage: ChatMessage;
}

export interface DeleteSessionResponse {
  success: boolean;
  message: string;
}

export interface MentorRecommendation {
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

export interface RemediationWeakTopic {
  category: string;
  wrongRate: number;
  totalAnswered: number;
  totalWrong: number;
  difficulty: string;
}

export interface RemediationLesson {
  lessonId: string;
  title: string;
  moduleId: string;
  reason: string;
}

export interface StudyPlanStep {
  day: number;
  title: string;
  tasks: string[];
}

export interface RemediationPlan {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  percentage: number;
  passed: boolean;
  weakTopics: RemediationWeakTopic[];
  recommendedLessons: RemediationLesson[];
  studyPlan: StudyPlanStep[];
  retakeGuidance: {
    canRetake: boolean;
    attemptsRemaining: number;
    recommendedBeforeRetake: string[];
  };
  mentorAdvice: string;
}

export interface LessonSummary {
  lessonId: string;
  title: string;
  summary: string;
  keyConcepts: string[];
  takeaways: string[];
}

export interface ModuleSummary {
  moduleId: string;
  title: string;
  overview: string;
  lessonSummaries: LessonSummary[];
  assessmentReadiness: {
    hasAssessment: boolean;
    assessmentIds: string[];
    readinessChecklist: string[];
  };
}

export interface StudyNotes {
  lessonId: string;
  title: string;
  notes: string;
  savedToNotes: boolean;
}

export interface MentorRecommendationsResponse {
  success: boolean;
  recommendations: MentorRecommendation[];
}

export interface RemediationResponse {
  success: boolean;
  remediation: RemediationPlan;
}

export interface LessonSummaryResponse {
  success: boolean;
  summary: LessonSummary;
}

export interface ModuleSummaryResponse {
  success: boolean;
  summary: ModuleSummary;
}

export interface StudyNotesResponse {
  success: boolean;
  notes: StudyNotes;
}

export type SmartButton = 'explain' | 'summarize' | 'notes' | 'example';
