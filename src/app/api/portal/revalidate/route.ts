import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import {
  MAX_REVALIDATE_BODY_BYTES,
  parseRevalidateBody,
  secretMatches,
} from "@/portal/lib/revalidate";

/**
 * El API de Armio avisa aquí cuando cambia algo visible del portal. Se expira la etiqueta al instante
 * (`expire: 0`): la siguiente visita espera datos frescos en vez de recibir los viejos.
 * Protegida con `PORTAL_REVALIDATE_SECRET` (Bearer, solo servidor).
 */

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  const secret = process.env.PORTAL_REVALIDATE_SECRET;
  if (!secret) {
    console.warn("[portal-revalidate] PORTAL_REVALIDATE_SECRET no está configurado");
    return json({ error: "not_configured" }, 503);
  }

  // La autenticación va antes de leer el cuerpo
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!secretMatches(provided, secret)) return json({ error: "unauthorized" }, 401);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_REVALIDATE_BODY_BYTES) return json({ error: "too_large" }, 413);
  const raw = await req.text();
  if (raw.length > MAX_REVALIDATE_BODY_BYTES) return json({ error: "too_large" }, 413);

  const tags = parseRevalidateBody(raw);
  if (!tags) return json({ error: "invalid" }, 400);

  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  // Solo la cantidad: las etiquetas llevan el slug de la agencia
  console.info("[portal-revalidate]", tags.length);
  return json({ revalidated: tags.length }, 200);
}
