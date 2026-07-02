import React from 'react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Loader2, Send } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * MessageInput - Input field for sending messages
 */
export const MessageInput = ({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = 'Ask anything about your lesson...',
}: MessageInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Cmd/Ctrl + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4 space-y-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={isLoading}
      maxLength={5000}
        rows={3}
        className="resize-none"
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {value.length}/5000 • Press Cmd+Enter to send
        </p>
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
