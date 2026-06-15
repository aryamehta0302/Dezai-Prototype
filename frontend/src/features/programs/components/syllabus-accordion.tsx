"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { ChevronDown, PlayCircle, FileText, HelpCircle, Clock } from "lucide-react";
import type { MockModule } from "@/lib/mock-data/courses";
import { formatDuration } from "@/shared/utils/format";

const lessonIcons = {
  video: PlayCircle,
  article: FileText,
  quiz: HelpCircle,
};

interface SyllabusAccordionProps {
  modules: MockModule[];
  className?: string;
}

export function SyllabusAccordion({ modules, className }: SyllabusAccordionProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set([modules[0]?.id])
  );

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {modules.map((mod, index) => {
        const isOpen = openModules.has(mod.id);
        const totalDuration = mod.lessons.reduce((sum, l) => sum + l.duration, 0);

        return (
          <div
            key={mod.id}
            className="rounded-lg border border-border-light overflow-hidden"
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-low transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-sm text-on-surface">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {mod.lessons.length} lessons · {formatDuration(totalDuration)}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {/* Lessons */}
            {isOpen && (
              <div className="border-t border-border-light bg-surface-low/50">
                {mod.lessons.map((lesson) => {
                  const Icon = lessonIcons[lesson.type] || FileText;
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border-light last:border-0"
                    >
                      <Icon className="h-4 w-4 text-muted flex-shrink-0" />
                      <span className="flex-1 text-sm text-on-surface-variant">
                        {lesson.title}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}m
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
