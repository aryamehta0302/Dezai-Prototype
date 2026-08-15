/**
 * AI Mentor Feature - Public API
 */

// Components
export { ChatWindow } from './components/chat-window';
export { MessageInput } from './components/message-input';
export { SessionSidebar } from './components/session-sidebar';
export { SmartButtons } from './components/smart-buttons';

// Hooks
export {
  useChatSessions,
  useChatSession,
  useCreateSession,
  useDeleteSession,
  useSendMessage,
  useUpdateContext,
} from './hooks/useChat';
export {
  useMentorRecommendations,
  useGenerateRemediation,
  useGenerateLessonSummary,
  useGenerateModuleSummary,
  useGenerateStudyNotes,
} from './hooks/useMentorIntelligence';

// Services
export { aiMentorApi } from './services/ai-mentor-api.service';

// Store
export { useChatStore } from './store/chat-store';

// Types
export type {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  SendMessageRequest,
  UpdateContextRequest,
  ChatSessionsResponse,
  ChatSessionResponse,
  SendMessageResponse,
  DeleteSessionResponse,
  MentorRecommendation,
  RemediationPlan,
  LessonSummary,
  ModuleSummary,
  StudyNotes,
  MentorRecommendationsResponse,
  RemediationResponse,
  LessonSummaryResponse,
  ModuleSummaryResponse,
  StudyNotesResponse,
} from './types';

// Pages
export { default as ChatPage } from './pages/chat-page';
