"use client";

import { Info, BookOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface ConceptHighlightProps {
  content: string;
  variant?: "definition" | "insight" | "warning";
}

export default function ConceptHighlight({ content, variant: defaultVariant }: ConceptHighlightProps) {
  let displayVariant: "definition" | "insight" | "warning" = defaultVariant || "insight";
  let bodyText = content;

  // Check if first line specifies the variant, e.g. variant=definition
  const lines = content.split("\n");
  if (lines[0] && lines[0].trim().startsWith("variant=")) {
    const parsed = lines[0].trim().substring(8).toLowerCase();
    if (parsed === "definition" || parsed === "insight" || parsed === "warning") {
      displayVariant = parsed;
      bodyText = lines.slice(1).join("\n");
    }
  }

  // Styles map based on variant
  const styles = {
    definition: {
      container: "bg-blue-500/5 border-blue-500/20 text-blue-100 dark:text-blue-200",
      title: "text-blue-400 font-bold",
      label: "Definition",
      icon: <BookOpen className="h-5 w-5 text-blue-400" />,
    },
    insight: {
      container: "bg-emerald-500/5 border-emerald-500/20 text-emerald-100 dark:text-emerald-200",
      title: "text-emerald-400 font-bold",
      label: "Insight",
      icon: <Info className="h-5 w-5 text-emerald-400" />,
    },
    warning: {
      container: "bg-amber-500/5 border-amber-500/20 text-amber-100 dark:text-amber-200",
      title: "text-amber-400 font-bold",
      label: "Important Warning",
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    },
  };

  const activeStyle = styles[displayVariant];

  return (
    <div className={cn("my-6 p-5 rounded-2xl border flex gap-4 items-start shadow-sm", activeStyle.container)}>
      <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
        {activeStyle.icon}
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        <span className={cn("text-xs uppercase tracking-wider", activeStyle.title)}>
          {activeStyle.label}
        </span>
        <p className="text-sm leading-relaxed whitespace-pre-line text-on-surface-variant font-medium">
          {bodyText.trim()}
        </p>
      </div>
    </div>
  );
}
