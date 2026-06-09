"use client";

import { cn } from "@/shared/utils/cn";

interface LessonContentProps {
  content: string;
  className?: string;
}

export function LessonContent({ content, className }: LessonContentProps) {
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 my-3 ml-4">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-on-surface-variant leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-on-surface mt-6 mb-3">
            {trimmed.substring(2)}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-on-surface mt-5 mb-2">
            {trimmed.substring(3)}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={i} className="text-lg font-medium text-on-surface mt-4 mb-2">
            {trimmed.substring(4)}
          </h3>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
      } else if (trimmed.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote key={i} className="border-l-4 border-primary/30 pl-4 my-4 text-on-surface-variant italic">
            {trimmed.substring(2)}
          </blockquote>
        );
      } else if (trimmed === "") {
        flushList();
      } else {
        flushList();
        // Handle inline bold (**text**)
        const formatted = trimmed.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-semibold text-on-surface">$1</strong>'
        );
        elements.push(
          <p
            key={i}
            className="text-on-surface-variant leading-relaxed my-2"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className={cn("prose-sm max-w-none", className)}>
      {renderContent(content)}
    </div>
  );
}
