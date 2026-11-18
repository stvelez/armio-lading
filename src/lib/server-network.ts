/**
 * Límite de red global del servidor Node.
 *
 * Next descarta el `AbortSignal` del fetch cuando revalida en segundo plano una entrada stale
 * (`doOriginalFetch(true)` en `patch-fetch`), así que el timeout de `portalGet` NO cubre esas
 * revalidaciones. El Agent de undici actúa a nivel de socket para todo `fetch` del proceso
 * (incluidas las revalidaciones ISR), sin tocar `fetch` ni el caché: Next sigue guardando y
 * revalidando con las mismas reglas.
 *
 * Se mantiene aquí, sin importar undici, para poder verificar los valores en tests.
 */
export const SERVER_NETWORK_TIMEOUT_MS = 10_000;

/** Opciones del Agent global de undici. Solo runtime nodejs (ver `instrumentation.ts`). */
export function serverNetworkAgentOptions() {
  return {
    connect: { timeout: SERVER_NETWORK_TIMEOUT_MS },
    headersTimeout: SERVER_NETWORK_TIMEOUT_MS,
    bodyTimeout: SERVER_NETWORK_TIMEOUT_MS,
  };
}
