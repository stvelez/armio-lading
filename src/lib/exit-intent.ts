"use client";

import { useEffect, useRef } from "react";

export function useExitIntent(onTrigger: () => void, enabled: boolean = true) {
  const triggered = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Only trigger once per session (check localStorage)
    if (typeof window !== "undefined" && localStorage.getItem("exitIntentShown")) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered.current) return;
      // Trigger when mouse moves to top of viewport (about to close/navigate)
      if (e.clientY <= 0) {
        triggered.current = true;
        localStorage.setItem("exitIntentShown", "1");
        onTrigger();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [enabled, onTrigger]);
}
