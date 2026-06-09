"use client";

import { cn } from "@/shared/utils/cn";
import { CheckCircle, XCircle } from "lucide-react";

interface RadioOptionProps {
  label: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
  isCorrect?: boolean;
  isWrong?: boolean;
  disabled?: boolean;
}

const optionLetters = ["A", "B", "C", "D", "E", "F"];

export function RadioOption({
  label,
  index,
  selected,
  onSelect,
  isCorrect,
  isWrong,
  disabled,
}: RadioOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
        selected && !isCorrect && !isWrong
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border-light hover:border-primary/30 hover:bg-surface-low",
        isCorrect && "border-success bg-success-container/50 ring-2 ring-success/20",
        isWrong && "border-destructive bg-error-container/50 ring-2 ring-destructive/20",
        disabled && "cursor-default"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold flex-shrink-0",
          selected && !isCorrect && !isWrong
            ? "bg-primary text-white"
            : "bg-surface-low text-on-surface-variant",
          isCorrect && "bg-success text-white",
          isWrong && "bg-destructive text-white"
        )}
      >
        {optionLetters[index]}
      </span>
      <span className="flex-1 text-sm text-on-surface">{label}</span>
      {isCorrect && <CheckCircle className="h-5 w-5 text-success" />}
      {isWrong && <XCircle className="h-5 w-5 text-destructive" />}
    </button>
  );
}
