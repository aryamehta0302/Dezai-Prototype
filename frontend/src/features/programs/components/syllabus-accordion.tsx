"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { ChevronDown, PlayCircle, FileText, Clock, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import type { ApiTrack } from "../types/program.types";

interface SyllabusAccordionProps {
  tracks: ApiTrack[];
  programSlug?: string;
  className?: string;
}

export function SyllabusAccordion({ tracks, programSlug, className }: SyllabusAccordionProps) {
  const flatModules = tracks.flatMap(t => t.modules);
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set([flatModules[0]?.id].filter(Boolean))
  );

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  if (flatModules.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {flatModules.map((mod, index) => {
        const isOpen = openModules.has(mod.id);

        return (
          <div key={mod.id} className="rounded-lg border border-border-light overflow-hidden">
            <button
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-low transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-sm text-on-surface">{mod.title}</h4>
                  <p className="text-xs text-muted mt-0.5">
                    {mod.lessons.length} lessons {mod.assessments && mod.assessments.length > 0 ? `\u00B7 ${mod.assessments.length} quiz(zes)` : ""}
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

            {isOpen && (
              <div className="border-t border-border-light bg-surface-low/50">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border-light last:border-0"
                  >
                    <PlayCircle className="h-4 w-4 text-muted flex-shrink-0" />
                    <span className="flex-1 text-sm text-on-surface-variant">
                      {lesson.title}
                    </span>
                    {lesson.videoUrl && (
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        video
                      </span>
                    )}
                  </div>
                ))}
                {mod.assessments && mod.assessments.length > 0 && programSlug && (
                  <div className="border-t border-border-light px-4 py-3 space-y-2">
                    {mod.assessments.map((asm) => (
                      <Link
                        key={asm.id}
                        href={`/programs/${programSlug}/assessment/${asm.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                      >
                        <ClipboardCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-primary">{asm.title}</span>
                          <p className="text-xs text-muted mt-0.5">
                            {asm.sampleSize} questions · {Math.floor(asm.timeLimit / 60)} min · {asm.passingScore}% to pass
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
