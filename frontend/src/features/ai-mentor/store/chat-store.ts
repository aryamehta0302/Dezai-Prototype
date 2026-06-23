import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatSession, ChatMessage } from '../types';

interface ChatStore {
  // State
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSessions: (sessions: ChatSession[]) => void;
  setCurrentSession: (sessionId: string | null, messages?: ChatMessage[]) => void;
  addSession: (session: ChatSession) => void;
  removeSession: (sessionId: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateSessionMessages: (sessionId: string, messages: ChatMessage[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearChat: () => void;
}

/**
 * Zustand store for chat state management
 * Persists current session ID and sessions list to localStorage
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // Initial state
      sessions: [],
      currentSessionId: null,
      currentMessages: [],
      isLoading: false,
      error: null,

      // Actions
      setSessions: (sessions) => set({ sessions }),

      setCurrentSession: (sessionId, messages) =>
        set({
          currentSessionId: sessionId,
          currentMessages: messages || [],
        }),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      removeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId ? null : state.currentSessionId,
          currentMessages:
            state.currentSessionId === sessionId ? [] : state.currentMessages,
        })),

      addMessage: (message) =>
        set((state) => ({
          currentMessages: [...state.currentMessages, message],
          sessions: state.sessions.map((s) =>
            s.id === state.currentSessionId
              ? { ...s, messages: [...(s.messages || []), message] }
              : s
          ),
        })),

      updateSessionMessages: (sessionId, messages) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, messages } : s
          ),
        })),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      clearChat: () =>
        set({
          currentSessionId: null,
          currentMessages: [],
          error: null,
        }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        sessions: state.sessions.map((s) => ({
          ...s,
          messages: undefined, // Don't persist messages to localStorage
        })),
      }),
    },
  ),
);
