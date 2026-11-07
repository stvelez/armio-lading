import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { isAllowedPortalTag } from "./tags";

/** SOLO SERVIDOR: utilidades de la ruta POST /api/portal/revalidate. */

export const MAX_REVALIDATE_TAGS = 50;
export const MAX_REVALIDATE_BODY_BYTES = 4 * 1024;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** Comparación en tiempo constante (el hash iguala el largo, así no se filtra por tamaño). */
export function secretMatches(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  return timingSafeEqual(sha256(provided), sha256(expected));
}

const bodySchema = z
  .object({ tags: z.array(z.string().max(256)).min(1).max(MAX_REVALIDATE_TAGS) })
  .strict();

/** Todo o nada: una etiqueta inválida invalida la petición. Devuelve las etiquetas sin duplicados. */
export function parseRevalidateBody(raw: string): string[] | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return null;
  if (!parsed.data.tags.every(isAllowedPortalTag)) return null;
  return [...new Set(parsed.data.tags)];
}
