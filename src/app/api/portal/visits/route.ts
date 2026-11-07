import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PORTAL_API_URL } from "@/portal/lib/api";
import { clientIp } from "@/portal/lib/client-ip";
import { classifyHost } from "@/portal/lib/host";
import { portalRootDomain } from "@/portal/lib/urls";
import { BOT_UA, UTM_FORMAT, VISIT_PAGES, VISIT_SOURCES } from "@/portal/lib/visit-source";

/**
 * Contador de visitas del portal: reenvía el beacon del navegador al API con la llave del servidor y la IP real.
 * Responde SIEMPRE 204 sin cuerpo (también si descarta o falla): nunca debe afectar la página ni revelar qué se contó.
 * El slug sale del host, no del cuerpo. Diseño: armio-api/docs/PORTAL_ANALYTICS_PLAN.md §6.1.
 */

const MAX_BODY_BYTES = 1024;
const MAX_CODE = 999_999_999;

const utm = z.string().regex(UTM_FORMAT).optional();

const bodySchema = z
  .object({
    page: z.enum(VISIT_PAGES),
    code: z.number().int().min(1).max(MAX_CODE).optional(),
    source: z.enum(VISIT_SOURCES),
    utm_source: utm,
    utm_medium: utm,
    utm_campaign: utm,
  })
  .superRefine((value, ctx) => {
    const isProperty = value.page === "property";
    if (isProperty !== (value.code !== undefined)) {
      ctx.addIssue({ code: "custom", path: ["code"], message: "code solo con page=property" });
    }
  });

const noContent = () =>
  new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/** ¿Es una petición de prefetch del router o del navegador? Esas no son visitas. */
function isPrefetch(req: NextRequest): boolean {
  const h = req.headers;
  return (
    h.has("next-router-prefetch") ||
    (h.get("purpose") ?? "").toLowerCase().includes("prefetch") ||
    (h.get("sec-purpose") ?? "").toLowerCase().includes("prefetch")
  );
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.PORTAL_SERVER_KEY;
    if (!key) return noContent();

    const site = req.headers.get("sec-fetch-site");
    if (site && site !== "same-origin") return noContent();
    if (isPrefetch(req)) return noContent();

    const userAgent = (req.headers.get("user-agent") ?? "").trim();
    if (!userAgent || BOT_UA.test(userAgent)) return noContent();

    const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host"))?.split(",")[0];
    const target = classifyHost(host, portalRootDomain());
    if (target.kind !== "portal") return noContent();

    const ip = clientIp(req);
    if (!ip) return noContent();

    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return noContent();
    let parsed;
    try {
      parsed = bodySchema.safeParse(JSON.parse(raw));
    } catch {
      return noContent();
    }
    if (!parsed.success) return noContent();
    const { code, ...rest } = parsed.data;

    // Se espera la respuesta (en serverless no hay garantía de terminar sin await) pero se ignora su estado
    await fetch(`${PORTAL_API_URL}/public/portal/${target.slug}/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-portal-key": key,
        "x-portal-client-ip": ip,
        "User-Agent": userAgent.slice(0, 255),
      },
      body: JSON.stringify({ ...rest, property_code: code }),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
  } catch {
    /* el contador nunca falla hacia afuera */
  }
  return noContent();
}
