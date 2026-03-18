"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Disables framer-motion animations on mobile (< 640px) for performance.
 * `prefers-reduced-motion` is handled separately via CSS (globals.css) and
 * by framer-motion's default "user" reducedMotion setting.
 *
 * ARM-70: Mobile scroll animations disabled for smooth UX on low-end devices.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState<"never" | "always" | "user">("user");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(e.matches ? "always" : "user");
    };
    update(mq);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}
