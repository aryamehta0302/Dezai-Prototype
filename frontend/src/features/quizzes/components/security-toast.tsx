"use client";

import { useEffect } from "react";

interface SecurityToastProps {
  onViolation: (type: "TAB_SWITCH" | "FOCUS_LOSS" | "COPY_PASTE") => void;
  isActive: boolean;
}

export function SecurityToast({ onViolation, isActive }: SecurityToastProps) {
  useEffect(() => {
    if (!isActive) return;

    // 1. Tab Switch / Page Visibility Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolation("TAB_SWITCH");
      }
    };

    // 2. Window Blur (Focus Loss) Detection
    const handleBlur = () => {
      onViolation("FOCUS_LOSS");
    };

    // 3. Clipboard Prevention & Detection
    const handleClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation("COPY_PASTE");
    };

    // 4. Disable DevTools & Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === "F12") {
        e.preventDefault();
        onViolation("COPY_PASTE");
      }
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C", "i", "j", "c"].includes(e.key)) {
        e.preventDefault();
        onViolation("COPY_PASTE");
      }
      // Prevent Cmd+Alt+I, Cmd+Alt+J, Cmd+Alt+C (Mac equivalents)
      if (e.metaKey && e.altKey && ["I", "J", "C", "i", "j", "c"].includes(e.key)) {
        e.preventDefault();
        onViolation("COPY_PASTE");
      }
      // Prevent Ctrl+Tab and Ctrl+Shift+Tab
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        onViolation("TAB_SWITCH");
      }
      // Prevent Ctrl+T (New Tab), Ctrl+N (New Window)
      if (e.ctrlKey && ["T", "t", "N", "n"].includes(e.key)) {
        e.preventDefault();
        onViolation("TAB_SWITCH");
      }
      // Prevent Ctrl+Shift+N (New Incognito), Ctrl+Shift+P (New Private Window)
      if (e.ctrlKey && e.shiftKey && ["N", "n", "P", "p"].includes(e.key)) {
        e.preventDefault();
        onViolation("TAB_SWITCH");
      }
      // Prevent Ctrl+S (Save page), Ctrl+U (View source)
      if (e.ctrlKey && ["S", "U", "s", "u"].includes(e.key)) {
        e.preventDefault();
        onViolation("COPY_PASTE");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleClipboard);
    document.addEventListener("cut", handleClipboard);
    document.addEventListener("paste", handleClipboard);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleClipboard);
      document.removeEventListener("cut", handleClipboard);
      document.removeEventListener("paste", handleClipboard);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, onViolation]);

  return null;
}

