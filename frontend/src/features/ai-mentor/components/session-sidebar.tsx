import React from 'react';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Plus, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import type { ChatSession } from '../types';

interface SessionSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isLoading?: boolean;
}

const getSessionTitle = (session: ChatSession) => {
  if (session.title?.trim()) return session.title;

  const firstMessage = session.messages?.find((message) => message.sender === 'USER');

  if (firstMessage?.content) {
    return firstMessage.content.length > 32
      ? `${firstMessage.content.substring(0, 32)}...`
      : firstMessage.content;
  }

  return 'New Chat';
};

const getLastMessagePreview = (session: ChatSession) => {
  const lastMessage = session.messages?.[session.messages.length - 1];

  if (!lastMessage?.content) return 'No messages yet';

  return lastMessage.content.length > 48
    ? `${lastMessage.content.substring(0, 48)}...`
    : lastMessage.content;
};

/**
 * SessionSidebar - Searchable chat session list with latest message preview
 */
export const SessionSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isLoading,
}: SessionSidebarProps) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSessions = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return sessions;

    return sessions.filter((session) => {
      const title = getSessionTitle(session).toLowerCase();
      const preview = getLastMessagePreview(session).toLowerCase();

      return title.includes(query) || preview.includes(query);
    });
  }, [sessions, searchQuery]);

  return (
    <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 space-y-3">
        <Button onClick={onCreateSession} className="w-full" disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Loading chats...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              <p>No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              <p>No matching chats</p>
              <p className="text-xs">Try another search</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions.map((session) => {
                const title = getSessionTitle(session);
                const preview = getLastMessagePreview(session);
                const displayDate = session.updatedAt || session.createdAt;

                return (
                  <div
                    key={session.id}
                    onMouseEnter={() => setHoveredId(session.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group relative"
                  >
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                        currentSessionId === session.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <div className="truncate font-medium pr-7">{title}</div>

                      <div className="truncate text-xs text-muted-foreground mt-1 pr-7">
                        {preview}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(displayDate), 'MMM d, HH:mm')}
                      </div>
                    </button>

                    {/* Delete button */}
                    {hoveredId === session.id && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="absolute right-2 top-2 p-1 text-destructive hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};