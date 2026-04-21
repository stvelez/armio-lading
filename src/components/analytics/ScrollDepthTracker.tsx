"use client";

import { useEffect, useRef } from "react";
import { trackScrollDepth } from "@/lib/analytics";

const THRESHOLDS = [25, 50, 75, 90] as const;

export default function ScrollDepthTracker() {
  const trackedThresholds = useRef(new Set<number>());

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScrollable = documentHeight - viewportHeight;

      if (maxScrollable <= 0) {
        return;
      }

      const percentScrolled = Math.round((scrollTop / maxScrollable) * 100);

      THRESHOLDS.forEach((threshold) => {
        if (percentScrolled >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          trackScrollDepth(threshold);
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
