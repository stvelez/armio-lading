import type {
  BaseTransportOptions,
  Envelope,
  EnvelopeItem,
  Transport,
  TransportMakeRequestResponse,
  TransportRequestExecutor,
} from "@sentry/core";
import { createTransport } from "@sentry/nextjs";

/**
 * Última barrera de privacidad del SDK: SOLO salen items `event`.
 *
 * `beforeSend` sanea el evento, pero no puede impedir que una integración futura añada al
 * envelope sesiones, replays, adjuntos, logs, métricas o client reports. Aquí se descartan
 * antes de serializar, así que ni siquiera llegan a la red. Sin eventos que enviar no se hace
 * la petición.
 *
 * El estado de sesión (`BrowserSession`) además se excluye en las integraciones, pero esta
 * allowlist es la garantía dura.
 */
export function eventOnlyTransport(inner: Transport): Transport {
  return {
    send: (envelope) => {
      const items = (envelope[1] as EnvelopeItem[]).filter((item) => item[0].type === "event");
      if (items.length === 0) return Promise.resolve({});
      // El tipo `Envelope` es una unión de envelopes concretos; tras filtrar solo quedan `event`.
      const filtered = [envelope[0], items] as unknown as Envelope;
      return inner.send(filtered);
    },
    flush: (timeout) => inner.flush(timeout),
  };
}

/** Ejecutor fetch mínimo: mismo contrato que usa el transporte HTTP del SDK. */
function fetchExecutor(options: BaseTransportOptions): TransportRequestExecutor {
  return async ({ body }) => {
    const response = await fetch(options.url, {
      method: "POST",
      // `Uint8Array<ArrayBufferLike>` no encaja en BodyInit para TS, pero fetch lo acepta.
      body: body as BodyInit,
      headers: options.headers,
      // En el navegador reduce la pérdida de eventos al cerrar la pestaña; Node lo ignora.
      keepalive: typeof window !== "undefined",
    });
    return {
      statusCode: response.status,
      headers: {
        "x-sentry-rate-limits": response.headers.get("X-Sentry-Rate-Limits"),
        "retry-after": response.headers.get("Retry-After"),
      },
    } satisfies TransportMakeRequestResponse;
  };
}

/** Transporte por defecto de la app: HTTP con allowlist de items. */
export function makeEventOnlyTransport(options: BaseTransportOptions): Transport {
  return eventOnlyTransport(createTransport(options, fetchExecutor(options)));
}
