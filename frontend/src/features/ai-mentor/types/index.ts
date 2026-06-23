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

export type SmartButton = 'explain' | 'summarize' | 'notes' | 'example';
