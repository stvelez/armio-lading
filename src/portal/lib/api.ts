import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type {
  PortalFilters,
  PortalIndexEntry,
  PortalListMeta,
  PortalProfile,
  PortalPropertyCard,
  PortalPropertyDetail,
  PortalSitemapEntry,
} from "../types";
import { PAGE_SIZE, toQuery } from "./filters";
import { PORTAL_INDEX_TAG, portalTag, propertyTag } from "./tags";

/**
 * Cliente del API público del portal. SOLO SERVIDOR: no importar desde componentes de cliente
 * (usa `PORTAL_SERVER_KEY` y `next/navigation` de servidor).
 */

export const PORTAL_API_URL = (
  process.env.PORTAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.armio.co/api/v1"
).replace(/\/$/, "");

const REVALIDATE_SECONDS = 300;

/**
 * Tope duro para los `fetch` BLOQUEANTES del portal: si el API no responde, el render/ISR falla
 * rápido en vez de quedarse colgado hasta el límite de la plataforma.
 *
 * `AbortSignal.timeout` NO desactiva el caché de Next 16: `patch-fetch` reenvía la señal al fetch
 * real y decide el caché por `next.revalidate`/tags (la clave de caché no incluye el signal), así
 * que el resultado se guarda y revalida igual. Verificado en
 * `node_modules/next/dist/server/lib/patch-fetch.js`. Por eso NO se usa `Promise.race`: la
 * petición perdedora seguiría viva ocupando una conexión hasta que el backend corte solo.
 *
 * OJO: Next descarta esta señal al revalidar en segundo plano una entrada stale
 * (`doOriginalFetch(true)`), para no abortar esa revalidación. Esas peticiones no las cubre este
 * timeout, sino el Agent global de undici de `src/instrumentation.ts` (límite de socket).
 */
const PORTAL_FETCH_TIMEOUT_MS = 10_000;

/** El índice alimenta `/sitemap.xml`: si el API está caído, es mejor rendirse antes. */
const PORTAL_INDEX_TIMEOUT_MS = 5_000;

export type ApiResult<T> =
  | { kind: "ok"; data: T; meta?: PortalListMeta }
  | { kind: "redirect"; slug: string }
  | { kind: "notfound" };

interface Envelope<T> {
  success?: boolean;
  data?: T;
  meta?: PortalListMeta;
}

async function portalGet<T>(path: string, tags: string[]): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${PORTAL_API_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags },
      signal: AbortSignal.timeout(PORTAL_FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    // El error nativo ("operation timed out") no dice qué consulta se cayó: añade la ruta.
    // Se comprueba `name` en vez de `instanceof DOMException` porque no todos los runtimes
    // de Vercel heredan de Error (y el resto de fallos debe propagarse intacto).
    const name = (error as { name?: unknown } | null)?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      throw new Error(`Portal API sin respuesta tras ${PORTAL_FETCH_TIMEOUT_MS} ms en ${path}`, {
        cause: error,
      });
    }
    throw error;
  }

  if (res.status === 404) return { kind: "notfound" };
  if (res.status === 400) return { kind: "notfound" }; // parámetros que el API no acepta
  if (!res.ok) throw new Error(`Portal API ${res.status} en ${path}`);

  const body = (await res.json()) as Envelope<T>;
  const data = body.data as (T & { redirect_to?: unknown }) | undefined;
  if (data && typeof data === "object" && typeof data.redirect_to === "string") {
    return { kind: "redirect", slug: data.redirect_to };
  }
  if (data === undefined || data === null) return { kind: "notfound" };
  return { kind: "ok", data: data as T, meta: body.meta };
}

const tagsFor = (slug: string, extra: string[] = []) => [portalTag(slug), ...extra];

/** Perfil (deduplicado por render). No lanza 404/redirect: lo resuelve quien lo llama. */
export const loadProfile = cache((slug: string) =>
  portalGet<PortalProfile>(`/public/portal/${encodeURIComponent(slug)}`, tagsFor(slug))
);

/**
 * Convierte un resultado en datos, o corta la página con 404 / redirección permanente al mismo
 * recorrido con el slug nuevo (`rebuild` arma la ruta con el slug vigente).
 */
export function unwrap<T>(result: ApiResult<T>, rebuild: (slug: string) => string): T {
  if (result.kind === "notfound") notFound();
  if (result.kind === "redirect") permanentRedirect(rebuild(result.slug));
  return result.data;
}

export async function getProfile(slug: string, rebuild: (slug: string) => string) {
  return unwrap(await loadProfile(slug), rebuild);
}

export const loadProperties = cache(async (slug: string, queryKey: string) => {
  return portalGet<PortalPropertyCard[]>(
    `/public/portal/${encodeURIComponent(slug)}/properties${queryKey}`,
    tagsFor(slug)
  );
});

export async function getProperties(
  slug: string,
  filters: PortalFilters,
  rebuild: (slug: string) => string,
  limit = PAGE_SIZE
): Promise<{ items: PortalPropertyCard[]; meta: PortalListMeta }> {
  const result = await loadProperties(slug, toQuery(filters, { limit }));
  const items = unwrap(result, rebuild);
  const meta = (result.kind === "ok" && result.meta) || {
    total: items.length,
    page: filters.page ?? 1,
    limit,
    totalPages: 1,
  };
  return { items, meta };
}

export const loadProperty = cache((slug: string, code: number) =>
  portalGet<PortalPropertyDetail>(
    `/public/portal/${encodeURIComponent(slug)}/properties/${code}`,
    tagsFor(slug, [propertyTag(slug, code)])
  )
);

export async function getSitemapEntries(slug: string): Promise<ApiResult<PortalSitemapEntry[]>> {
  return portalGet<PortalSitemapEntry[]>(
    `/public/portal/${encodeURIComponent(slug)}/sitemap`,
    tagsFor(slug)
  );
}

/** Portales habilitados (necesita la llave del servidor). Devuelve [] ante cualquier fallo. */
export async function getPortalIndex(): Promise<PortalIndexEntry[]> {
  const key = process.env.PORTAL_SERVER_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`${PORTAL_API_URL}/public/portal/index`, {
      headers: { Accept: "application/json", "x-portal-key": key },
      next: { revalidate: 3600, tags: [PORTAL_INDEX_TAG] },
      signal: AbortSignal.timeout(PORTAL_INDEX_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as Envelope<PortalIndexEntry[]>;
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return [];
  }
}
