"use client";

import { cn } from "@/shared/utils/cn";
import { LucideIcon, FileQuestion } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="rounded-2xl bg-surface-low p-4 mb-4">
        <Icon className="h-10 w-10 text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
