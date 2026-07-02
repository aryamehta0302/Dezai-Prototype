'use client';

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useChatSessions, useChatSession, useCreateSession, useDeleteSession, useSendMessage } from '../hooks/useChat';
import { useChatStore } from '../store/chat-store';
import { ChatWindow } from '../components/chat-window';
import { MessageInput } from '../components/message-input';
import { SessionSidebar } from '../components/session-sidebar';
import { SmartButtons } from '../components/smart-buttons';
import { Button } from '@/shared/ui/button';
import { RefreshCw } from 'lucide-react';

const friendlyMentorError = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : '';
  if (/unavailable|429|rate.?limit|503|failed to fetch|network/i.test(message)) {
    return 'The AI Mentor is taking a short break. Please try again in a moment.';
  }
  return fallback;
};

/**
 * ChatPage - Main AI Mentor chat interface
 */
export default function ChatPage() {

  // Store state
  const {
    sessions,
    currentSessionId,
    currentMessages,
    isLoading,
    error,
    setSessions,
    setCurrentSession,
    addSession,
    removeSession,
    addMessage,
    setIsLoading,
    setError,
    clearError,
  } = useChatStore();

  // Local state
  const [messageInput, setMessageInput] = React.useState('');
  const [failedMessage, setFailedMessage] = React.useState<string | null>(null);

  // React Query hooks
  const sessionsQuery = useChatSessions();
  const sessionQuery = useChatSession(currentSessionId);
  const createSessionMutation = useCreateSession();
  const deleteSessionMutation = useDeleteSession();
  const sendMessageMutation = useSendMessage();

  // Load sessions on mount
  useEffect(() => {
    if (sessionsQuery.data) {
      setSessions(sessionsQuery.data.sessions);
    }
  }, [sessionsQuery.data, setSessions]);

  // Load session on selection (from API to get full messages)
  useEffect(() => {
    if (currentSessionId && sessionQuery.data?.session) {
      const messages = sessionQuery.data.session.messages || [];
      setCurrentSession(currentSessionId, messages);
    }
  }, [currentSessionId, sessionQuery.data, setCurrentSession]);

  // Handle create session
  const handleCreateSession = async () => {
    try {
      setIsLoading(true);
      const result = await createSessionMutation.mutateAsync({});
      addSession(result.session);
      setCurrentSession(result.session.id, []);
      setMessageInput('');
      clearError();
    } catch (err) {
      const message = friendlyMentorError(err, 'We could not start a new chat. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      removeSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSession(null);
        setMessageInput('');
      }
      toast.success('Chat deleted');
    } catch (err) {
      const message = friendlyMentorError(err, 'We could not delete this chat. Please try again.');
      setError(message);
      toast.error(message);
    }
  };

  // Handle send message
  const handleSendMessage = async (retryContent?: string) => {
    const content = retryContent ?? messageInput;
    if (!currentSessionId || !content.trim()) return;

    const userInput = content;
    setMessageInput('');
    setIsLoading(true);
    setFailedMessage(null);

    try {
      const result = await sendMessageMutation.mutateAsync({
        sessionId: currentSessionId,
        content: userInput,
      });

      // Add both messages to store (also syncs to sessions array)
      addMessage(result.userMessage);
      addMessage(result.mentorMessage);

      clearError();
    } catch (err) {
      const message = friendlyMentorError(
        err,
        'The AI Mentor could not answer that just now. Please try again.',
      );
      setError(message);
      setFailedMessage(userInput);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle smart button click
  const handleSmartButton = (prompt: string) => {
    setMessageInput(prompt);
  };

  return (
    <div className="flex h-[calc(100vh-60px)] gap-0">
      {/* Sidebar */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSession(id)}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        isLoading={sessionsQuery.isLoading}
      />

      {/* Main Chat Area */}
      {currentSessionId ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Window */}
          <ChatWindow
            messages={currentMessages}
            isLoading={isLoading || sessionQuery.isLoading}
          />

          {/* Smart Buttons */}
          <SmartButtons onSelect={handleSmartButton} disabled={isLoading} />

          {/* Message Input */}
          <MessageInput
            value={messageInput}
            onChange={setMessageInput}
            onSend={handleSendMessage}
            isLoading={isLoading}
          />

          {/* Error Display */}
          {error && (
            <div className="flex items-center justify-between gap-3 bg-destructive/10 border-t border-destructive/20 text-destructive px-4 py-2 text-sm">
              <span>{error}</span>
              {failedMessage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(failedMessage)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to AI Mentor</h2>
            <p className="text-muted-foreground mb-6">
              Create a new chat to start learning with AI assistance
            </p>
            <button
              onClick={handleCreateSession}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Start New Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
