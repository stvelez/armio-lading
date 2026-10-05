"use client";

import { useSyncExternalStore } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getConsent, subscribeConsent } from "@/lib/consent";

/** Carga Google Analytics solo si la persona aceptó las cookies de analítica. */
export default function AnalyticsGate({ gaId }: { gaId: string }) {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => null);

  if (consent !== "accepted" || !gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
