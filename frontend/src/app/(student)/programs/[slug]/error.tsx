"use client";

import { PageContainer } from "@/shared/components/page-container";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="py-16">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-danger" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">Something went wrong</h2>
        <p className="text-sm text-muted max-w-md">
          Failed to load this course. It may have been removed or a temporary issue occurred.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-all"
        >
          Try again
        </button>
      </div>
    </PageContainer>
  );
}
