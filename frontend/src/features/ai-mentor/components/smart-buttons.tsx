import React from 'react';
import { Button } from '@/shared/ui/button';
import {
  Lightbulb,
  BookOpen,
  FileText,
  Zap,
} from 'lucide-react';

interface SmartButtonsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * SmartButtons - Quick action buttons for common tasks
 */
export const SmartButtons = ({ onSelect, disabled }: SmartButtonsProps) => {
  const buttons = [
    {
      label: 'Explain Concept',
      icon: Lightbulb,
      prompt: 'Can you explain this concept in a simpler way?',
    },
    {
      label: 'Summarize',
      icon: BookOpen,
      prompt: 'Can you provide a brief summary of the key points?',
    },
    {
      label: 'Generate Notes',
      icon: FileText,
      prompt: 'Can you generate study notes for this topic?',
    },
    {
      label: 'Real Example',
      icon: Zap,
      prompt: 'Can you provide a real-world example of this concept?',
    },
  ];

  return (
    <div className="border-t border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold text-muted-foreground mb-3">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <Button
              key={button.label}
              variant="outline"
              size="sm"
              onClick={() => onSelect(button.prompt)}
              disabled={disabled}
              className="text-xs h-auto py-2"
            >
              <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{button.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
