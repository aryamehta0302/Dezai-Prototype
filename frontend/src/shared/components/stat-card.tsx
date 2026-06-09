"use client";

import { cn } from "@/shared/utils/cn";
import { LucideIcon } from "lucide-react";
import { TrendIndicator } from "@/shared/types/common.types";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: TrendIndicator;
  description?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description, className }: StatCardProps) {
  return (
    <div className={cn("card-elevation p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-on-surface font-[family-name:var(--font-heading)]">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      {(trend || description) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-sm font-medium",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-destructive",
                trend.direction === "neutral" && "text-muted"
              )}
            >
              {trend.direction === "up" && <ArrowUpRight className="h-4 w-4" />}
              {trend.direction === "down" && <ArrowDownRight className="h-4 w-4" />}
              {trend.direction === "neutral" && <Minus className="h-4 w-4" />}
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {description && <span className="text-sm text-muted">{description}</span>}
        </div>
      )}
    </div>
  );
}
