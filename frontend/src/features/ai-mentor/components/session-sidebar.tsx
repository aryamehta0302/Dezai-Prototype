import React from 'react';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Plus, Trash2, Loader2 } from 'lucide-react';
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

/**
 * SessionSidebar - List of chat sessions
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

  return (
    <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <Button onClick={onCreateSession} className="w-full" disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sessions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              <p>No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
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
                    <div className="truncate font-medium">
                      {/* Show first message as title, or generic title */}
                      {session.messages && session.messages.length > 0
                        ? session.messages[0].content.substring(0, 30)
                        : 'New Chat'}
                      ...
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(session.createdAt), 'MMM d, HH:mm')}
                    </div>
                  </button>

                  {/* Delete button */}
                  {hoveredId === session.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-destructive hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
