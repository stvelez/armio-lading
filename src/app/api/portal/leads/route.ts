import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PORTAL_API_URL } from "@/portal/lib/api";

/**
 * Proxy del formulario de interés del portal. El navegador nunca habla con el API ni ve la clave
 * del servidor (`PORTAL_SERVER_KEY`): aquí se reenvía con la IP real del visitante.
 */

const MAX_BODY_BYTES = 8 * 1024;

const bodySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
  property_code: z.number().int().positive().max(2_000_000_000).optional(),
  name: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(100).optional(),
  message: z.string().max(1000).optional(),
  consent: z.literal(true),
  consent_version: z.string().min(1).max(20),
  marketing_consent: z.boolean().optional(),
  website: z.string().max(200),
  elapsed_ms: z.number().int().min(0).max(86_400_000),
  page_url: z.string().max(500).optional(),
});

const IP = /^[0-9a-fA-F:.]{3,45}$/;

function clientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || req.headers.get("x-real-ip")?.trim();
  return candidate && IP.test(candidate) ? candidate : null;
}

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "invalid" }, 400);

  let parsed;
  try {
    parsed = bodySchema.safeParse(JSON.parse(raw));
  } catch {
    return json({ error: "invalid" }, 400);
  }
  if (!parsed.success) return json({ error: "invalid" }, 400);

  const { slug, ...payload } = parsed.data;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent.slice(0, 255);

  const key = process.env.PORTAL_SERVER_KEY;
  const ip = clientIp(req);
  if (key) {
    headers["x-portal-key"] = key;
    if (ip) headers["x-portal-client-ip"] = ip;
  } else {
    console.warn(
      "PORTAL_SERVER_KEY no está definida: el límite por IP del API usará la IP del servidor"
    );
  }

  try {
    const res = await fetch(`${PORTAL_API_URL}/public/portal/${slug}/leads`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 202) return json({ received: true }, 202);
    if (res.status === 400) return json({ error: "invalid" }, 400);
    if (res.status === 404) return json({ error: "not_found" }, 404);
    if (res.status === 429) return json({ error: "rate_limited" }, 429);
    return json({ error: "unavailable" }, 502);
  } catch {
    return json({ error: "unavailable" }, 502);
  }
}
