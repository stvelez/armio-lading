import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry-privacy";

export function register() {
  // Mismo init para Node y Edge. Sin DSN no se inicializa y la app funciona igual.
  const options = sentryOptions(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN);
  if (options) Sentry.init(options);
}

// Errores de servidor (render, route handlers, server actions, proxy). No-op si Sentry no se inició.
export const onRequestError = Sentry.captureRequestError;
