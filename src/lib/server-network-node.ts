import { Agent, setGlobalDispatcher } from "undici";
import { serverNetworkAgentOptions } from "@/lib/server-network";

/**
 * SOLO NODE. Se importa condicionalmente desde `instrumentation.register()` cuando
 * `NEXT_RUNTIME === "nodejs"`, para que el bundle de edge no arrastre undici.
 *
 * El Agent global pone tope a TODA conexión saliente del proceso: connect, espera de headers y
 * lectura de body. Cubre los fetch del portal en ISR y las revalidaciones stale que Next ejecuta
 * sin signal. No cambia el caché ni la semántica de `revalidate`.
 */

let configured = false;

/** Idempotente: evita reemplazar el dispatcher si `register()` se vuelve a ejecutar (dev/HMR). */
export function setupServerNetworkTimeouts(): void {
  if (configured) return;
  setGlobalDispatcher(new Agent(serverNetworkAgentOptions()));
  configured = true;
}
