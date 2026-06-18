import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { ScrollArea } from '@/shared/ui/scroll-area';
import type { ChatMessage } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

/**
 * ChatWindow - Display conversation history
 */
export const ChatWindow = ({ messages, isLoading }: ChatWindowProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 border-b border-border bg-background p-4">
      <div className="space-y-4 pr-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <div>
              <p className="text-lg font-semibold">Start a conversation</p>
              <p className="text-sm">Ask the AI Mentor any question about your lessons.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-fadeIn',
                message.sender === 'USER' ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white',
                  message.sender === 'USER' ? 'bg-primary' : 'bg-emerald-600',
                )}
              >
                {message.sender === 'USER' ? 'You' : 'AI'}
              </div>

              {/* Message */}
              <div
                className={cn(
                  'max-w-xs lg:max-w-md xl:max-w-lg rounded-lg px-4 py-2 text-sm',
                  message.sender === 'USER'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-1 opacity-70',
                    message.sender === 'USER'
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {format(new Date(message.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white">
              AI
            </div>
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
