import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiMentorApi } from '../services/ai-mentor-api.service';
import type { ChatSession, SendMessageRequest } from '../types';

const QUERY_KEYS = {
  sessions: () => ['ai-mentor', 'sessions'],
  session: (id: string) => ['ai-mentor', 'session', id],
};

/**
 * Hook to fetch user's chat sessions
 */
export const useChatSessions = (limit: number = 50, offset: number = 0) => {
  return useQuery({
    queryKey: QUERY_KEYS.sessions(),
    queryFn: () => aiMentorApi.getSessions(limit, offset),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch a specific chat session
 */
export const useChatSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: sessionId ? QUERY_KEYS.session(sessionId) : [],
    queryFn: () =>
      sessionId ? aiMentorApi.getSession(sessionId) : Promise.resolve(null),
    enabled: !!sessionId,
    staleTime: 30000,
  });
};

/**
 * Hook to create a new chat session
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiMentorApi.createSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sessions(),
      });
    },
  });
};

/**
 * Hook to delete a chat session
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => aiMentorApi.deleteSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sessions(),
      });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.session(sessionId),
      });
    },
  });
};

/**
 * Hook to send a message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => aiMentorApi.sendMessage(data),
    onSuccess: (data) => {
      // Invalidate the session query to refresh messages
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session(data.userMessage.sessionId),
      });
    },
  });
};

/**
 * Hook to update session context
 */
export const useUpdateContext = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof aiMentorApi.updateContext>[1]) =>
      aiMentorApi.updateContext(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session(sessionId),
      });
    },
  });
};

/**
 * Hook to update session title
 */
export const useUpdateSessionTitle = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string }) =>
      aiMentorApi.updateSessionTitle(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sessions(),
      });
    },
  });
};
