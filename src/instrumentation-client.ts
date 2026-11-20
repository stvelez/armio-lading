// Sentry se carga en tiempo ocioso: su SDK no debe competir con la primera pintura.
// Solo errores: sin Session Replay, sin tracing y sin PII (ver `sentry-privacy`).
type SentryModule = typeof import("@sentry/nextjs");

let sentry: SentryModule | null = null;

function loadSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  void import("@sentry/nextjs").then(async (mod) => {
    const { sentryOptions } = await import("@/lib/sentry-privacy");
    const options = sentryOptions(dsn);
    if (options) mod.init(options);
    sentry = mod;
  });
}

if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadSentry, { timeout: 2000 });
  } else {
    setTimeout(loadSentry, 2000);
  }
}

export function onRouterTransitionStart(
  ...args: Parameters<SentryModule["captureRouterTransitionStart"]>
) {
  sentry?.captureRouterTransitionStart(...args);
}
