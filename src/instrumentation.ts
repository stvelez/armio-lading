import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry-privacy";

export async function register() {
  // Mismo init para Node y Edge. Sin DSN no se inicializa y la app funciona igual.
  // Va primero (sincrónico) para no retrasar la captura de errores tempranos.
  const options = sentryOptions(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN);
  if (options) Sentry.init(options);

  // Límites de red globales en Node: cubren también las revalidaciones ISR que Next ejecuta sin
  // signal. En edge no aplica (no hay undici ni sockets propios).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { setupServerNetworkTimeouts } = await import("./lib/server-network-node");
      setupServerNetworkTimeouts();
    } catch (error) {
      // Un fallo al configurar red no debe impedir que la app arranque.
      console.warn("[network] no se pudo configurar el Agent global de undici:", error);
    }
  }
}

// Errores de servidor (render, route handlers, server actions, proxy). No-op si Sentry no se inició.
export const onRequestError = Sentry.captureRequestError;
