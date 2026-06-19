"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useReducedMotion } from "framer-motion";

interface InteractiveCognitiveAnchorProps {
  content: string;
}

export default function InteractiveCognitiveAnchor({ content }: InteractiveCognitiveAnchorProps) {
  const [isActive, setIsActive] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      {
        threshold: 0.8, // Trigger when 80% visible
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <span className="font-semibold text-primary/90 underline decoration-dotted decoration-primary/50">
        {content}
      </span>
    );
  }

  return (
    <span
      ref={elementRef}
      className={cn(
        "inline-block px-1 rounded transition-all duration-700 cursor-help border-b border-dashed border-primary/30",
        isActive
          ? "font-extrabold text-primary scale-[1.03] bg-primary/5 shadow-[0_0_12px_rgba(0,87,205,0.15)] animate-pulse"
          : "font-semibold text-on-surface-variant hover:text-primary hover:font-bold hover:scale-[1.02]"
      )}
    >
      {content}
    </span>
  );
}
