import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry-privacy";

// Solo errores: sin Session Replay (no se añaden replaysSessionSampleRate/replaysOnErrorSampleRate
// ni la integración), sin tracing, sin PII. Sin NEXT_PUBLIC_SENTRY_DSN no se inicializa.
const options = sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN);
if (options) Sentry.init(options);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
