"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { QUIZ_CONSTANTS } from "../constants/quiz.constants";
import { AlertTriangle } from "lucide-react";

interface SecurityToastProps {
  onTabSwitch: () => void;
  tabSwitchCount: number;
  isActive: boolean;
}

export function SecurityToast({ onTabSwitch, tabSwitchCount, isActive }: SecurityToastProps) {
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onTabSwitch();
        const remaining = QUIZ_CONSTANTS.MAX_TAB_SWITCHES - tabSwitchCount - 1;

        if (remaining <= 0) {
          toast.error("Maximum tab switches exceeded. Quiz will be submitted.", {
            icon: <AlertTriangle className="h-4 w-4" />,
            duration: 5000,
          });
        } else {
          toast.warning(
            `Tab switch detected! ${remaining} warning${remaining !== 1 ? "s" : ""} remaining before auto-submit.`,
            {
              icon: <AlertTriangle className="h-4 w-4" />,
              duration: 4000,
            }
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, onTabSwitch, tabSwitchCount]);

  return null;
}
