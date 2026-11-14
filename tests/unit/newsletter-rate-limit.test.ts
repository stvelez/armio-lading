import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.fn();
vi.mock("@/lib/postgres", () => ({ getPostgresPool: () => ({ query }) }));

const createWaitlistSignup = vi.fn();
const markWelcomeEmailSent = vi.fn();
vi.mock("@/lib/waitlist-postgres", () => ({
  createWaitlistSignup: (...a: unknown[]) => createWaitlistSignup(...a),
  markWelcomeEmailSent: (...a: unknown[]) => markWelcomeEmailSent(...a),
  normalizeEmail: (e: string) => e.trim().toLowerCase(),
}));
const sendWelcomeEmail = vi.fn();
vi.mock("@/lib/resend", () => ({ sendWelcomeEmail: (...a: unknown[]) => sendWelcomeEmail(...a) }));

import { NEWSLETTER_LIMIT_GLOBAL, NEWSLETTER_LIMIT_PER_IP, hitRateLimit } from "@/lib/rate-limit";
import { POST } from "@/app/api/newsletter/route";

/** Simula la tabla de contadores: cada INSERT…RETURNING devuelve el siguiente `hits` del bucket. */
function fakeCounters(initial: Record<string, number> = {}) {
  const counters = { ...initial };
  query.mockImplementation(async (sql: string, params?: unknown[]) => {
    if (sql.includes("INSERT INTO rate_limit_hits")) {
      const bucket = params![0] as string;
      counters[bucket] = (counters[bucket] ?? 0) + 1;
      return { rows: [{ hits: counters[bucket] }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  });
  return counters;
}

const body = { email: "Ana@Example.com", source: "hero", consent: true, policyVersion: "1" };
function req(payload: unknown = body, ip = "203.0.113.7") {
  return new NextRequest("https://armio.co/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  createWaitlistSignup.mockResolvedValue({ created: true });
  sendWelcomeEmail.mockResolvedValue(undefined);
  markWelcomeEmailSent.mockResolvedValue(undefined);
});

describe("hitRateLimit", () => {
  it("permite hasta el límite y bloquea el siguiente", async () => {
    fakeCounters();
    const results = [];
    for (let i = 0; i < 4; i++) results.push((await hitRateLimit("b", 3)).allowed);
    expect(results).toEqual([true, true, true, false]);
  });

  it("calcula Retry-After hasta el cierre de la ventana de 1 h", async () => {
    fakeCounters();
    const start = Math.floor(Date.now() / 3_600_000) * 3_600_000;
    const r = await hitRateLimit("b", 1, start + 3_599_000);
    expect(r.retryAfter).toBe(1);
    const r2 = await hitRateLimit("c", 1, start + 1_000);
    expect(r2.retryAfter).toBe(3599);
  });
});

describe("POST /api/newsletter", () => {
  it("dentro del límite crea el alta y envía el correo", async () => {
    fakeCounters();
    const res = await POST(req());
    expect(res.status).toBe(201);
    expect(createWaitlistSignup).toHaveBeenCalledOnce();
    expect(sendWelcomeEmail).toHaveBeenCalledWith("ana@example.com");
  });

  it(`la IP ${NEWSLETTER_LIMIT_PER_IP + 1}ª en la hora recibe 429 sin tocar la base ni Resend`, async () => {
    fakeCounters();
    for (let i = 0; i < NEWSLETTER_LIMIT_PER_IP; i++) {
      expect((await POST(req())).status).toBe(201);
    }
    createWaitlistSignup.mockClear();
    sendWelcomeEmail.mockClear();

    const res = await POST(req());
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(createWaitlistSignup).not.toHaveBeenCalled();
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("otra IP no queda bloqueada por la primera", async () => {
    fakeCounters();
    for (let i = 0; i <= NEWSLETTER_LIMIT_PER_IP; i++) await POST(req());
    expect((await POST(req(body, "198.51.100.9"))).status).toBe(201);
  });

  it("el tope global frena aunque la IP sea nueva", async () => {
    fakeCounters({ "newsletter:global": NEWSLETTER_LIMIT_GLOBAL });
    const res = await POST(req(body, "198.51.100.77"));
    expect(res.status).toBe(429);
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("un correo inválido responde 400 y no consume el límite", async () => {
    const counters = fakeCounters();
    const res = await POST(req({ ...body, email: "no-es-correo" }));
    expect(res.status).toBe(400);
    expect(Object.keys(counters)).toHaveLength(0);
  });

  it("no guarda la IP en claro en el bucket", async () => {
    const counters = fakeCounters();
    await POST(req());
    expect(Object.keys(counters).some((k) => k.includes("203.0.113.7"))).toBe(false);
  });
});
