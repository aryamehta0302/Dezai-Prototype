import { apiClient } from '@/core/api/client';
import type {
  ChatSession,
  ChatSessionsResponse,
  ChatSessionResponse,
  CreateSessionRequest,
  SendMessageRequest,
  SendMessageResponse,
  UpdateContextRequest,
  DeleteSessionResponse,
} from '../types';

/**
 * AI Mentor API Service
 * Handles all chat session and messaging API calls
 */
export const aiMentorApi = {
  /**
   * Get all chat sessions for the current user
   */
  getSessions: (limit: number = 50, offset: number = 0) =>
    apiClient.get<ChatSessionsResponse>(
      `/ai-mentor/sessions?limit=${limit}&offset=${offset}`,
    ),

  /**
   * Create a new chat session
   */
  createSession: (data: CreateSessionRequest) =>
    apiClient.post<ChatSessionResponse>('/ai-mentor/sessions', data),

  /**
   * Get a specific chat session with all messages
   */
  getSession: (sessionId: string) =>
    apiClient.get<ChatSessionResponse>(`/ai-mentor/sessions/${sessionId}`),

  /**
   * Delete a chat session
   */
  deleteSession: (sessionId: string) =>
    apiClient.delete<DeleteSessionResponse>(`/ai-mentor/sessions/${sessionId}`),

  /**
   * Send a message and get mentor response
   */
  sendMessage: (data: SendMessageRequest) =>
    apiClient.post<SendMessageResponse>('/ai-mentor/chat', data),

  /**
   * Update session context (active program/module/lesson)
   */
  updateContext: (sessionId: string, data: UpdateContextRequest) =>
    apiClient.post<ChatSessionResponse>(
      `/ai-mentor/sessions/${sessionId}/context`,
      data,
    ),

  /**
   * Update session title
   */
  updateSessionTitle: (sessionId: string, data: { title: string }) =>
    apiClient.patch<ChatSessionResponse>(
      `/ai-mentor/sessions/${sessionId}/title`,
      data,
    ),
};
