import type { Envelope, Transport } from "@sentry/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { eventOnlyTransport, makeEventOnlyTransport } from "@/lib/sentry-transport";

/** Envelope mínimo: solo importa el tipo de cada item. */
const envelope = (items: [Record<string, unknown>, unknown][]): Envelope =>
  [{ sent_at: "2026-11-17T00:00:00.000Z" }, items] as unknown as Envelope;

const itemTypes = (env: Envelope): unknown[] =>
  (env[1] as unknown as [Record<string, unknown>, unknown][]).map(([headers]) => headers.type);

function recordingInner() {
  const sent: Envelope[] = [];
  const inner: Transport = {
    send: async (env) => {
      sent.push(env);
      return { statusCode: 200 };
    },
    flush: async () => true,
  };
  return { sent, inner };
}

afterEach(() => vi.unstubAllGlobals());

describe("transporte solo-eventos", () => {
  it("descarta sesiones, replays y adjuntos sin tocar la red", async () => {
    const { sent, inner } = recordingInner();
    const transport = eventOnlyTransport(inner);
    const result = await transport.send(
      envelope([
        [{ type: "session" }, { sid: "s" }],
        [{ type: "sessions" }, { sid: "s" }],
        [{ type: "replay_event" }, { replay_id: "r" }],
        [{ type: "replay_recording" }, "SECRET-REPLAY"],
        [{ type: "attachment", filename: "ana.txt" }, "SECRET-ATTACHMENT"],
      ])
    );
    expect(result).toEqual({});
    expect(sent).toHaveLength(0);
  });

  it("si hay evento, envía SOLO los items event", async () => {
    const { sent, inner } = recordingInner();
    const transport = eventOnlyTransport(inner);
    await transport.send(
      envelope([
        [{ type: "session" }, { sid: "s" }],
        [{ type: "event" }, { event_id: "abc" }],
        [{ type: "attachment", filename: "ana.txt" }, "SECRET-ATTACHMENT"],
      ])
    );
    expect(sent).toHaveLength(1);
    expect(itemTypes(sent[0])).toEqual(["event"]);
    expect(JSON.stringify(sent[0])).not.toContain("SECRET-ATTACHMENT");
  });

  it("el transporte real filtra el body serializado y respeta rate limits", async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response(null, {
          status: 200,
          headers: { "X-Sentry-Rate-Limits": "60:organization", "Retry-After": "60" },
        })
    );
    vi.stubGlobal("fetch", fetchSpy);
    const transport = makeEventOnlyTransport({
      url: "https://example.invalid/api/1/envelope/",
      recordDroppedEvent: vi.fn(),
      bufferSize: 4,
    });

    const result = await transport.send(
      envelope([
        [{ type: "event" }, { event_id: "abc", message: "boom" }],
        [{ type: "attachment", filename: "ana.txt" }, "SECRET-ATTACHMENT"],
        [{ type: "session" }, { sid: "s" }],
      ])
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = String((fetchSpy.mock.calls[0] as unknown as [string, RequestInit])[1].body);
    expect(body).toContain('"type":"event"');
    expect(body).not.toMatch(
      /"type":"(attachment|session|sessions|replay_event|replay_recording)"/
    );
    expect(body).not.toContain("SECRET-ATTACHMENT");
    expect(result.statusCode).toBe(200);
  });

  it("un envelope sin eventos no llega a fetch", async () => {
    const fetchSpy = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
    const transport = makeEventOnlyTransport({
      url: "https://example.invalid/api/1/envelope/",
      recordDroppedEvent: vi.fn(),
    });
    await transport.send(envelope([[{ type: "client_report" }, { discarded_events: [] }]]));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
