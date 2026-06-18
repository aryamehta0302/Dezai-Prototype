"use client";

import type { ApiResource } from "@/features/programs/types/program.types";
import { FileText, Link as LinkIcon, FileArchive, HelpCircle, Download } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface LessonResourceListProps {
  resources: ApiResource[] | undefined;
  className?: string;
}

export function LessonResourceList({ resources, className }: LessonResourceListProps) {
  if (!resources || resources.length === 0) return null;

  // Render different icon based on resource type
  const getResourceIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("pdf") || lowerType.includes("document") || lowerType.includes("doc")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (lowerType.includes("link") || lowerType.includes("url") || lowerType.includes("web")) {
      return <LinkIcon className="h-5 w-5 text-primary" />;
    }
    if (lowerType.includes("zip") || lowerType.includes("rar") || lowerType.includes("archive")) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    return <HelpCircle className="h-5 w-5 text-slate-400" />;
  };

  return (
    <div className={cn("space-y-4 bg-surface px-6 py-5 rounded-2xl border border-border-light shadow-sm", className)}>
      <div>
        <h3 className="font-semibold text-base text-on-surface">Resources & Attachments</h3>
        <p className="text-xs text-muted mt-0.5">Reference materials and downloads for this lesson</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {resources
          .sort((a, b) => a.order - b.order)
          .map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-surface-low border border-border-light hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-surface border border-border-light group-hover:border-primary/10 transition-colors">
                  {getResourceIcon(res.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {res.title}
                  </p>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold text-[10px] mt-0.5">
                    {res.type}
                  </p>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted group-hover:text-primary transition-colors flex-shrink-0 ml-3" />
            </a>
          ))}
      </div>
    </div>
  );
}
