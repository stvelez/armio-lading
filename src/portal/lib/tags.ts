/**
 * Etiquetas de caché del portal: un solo lugar donde se arman (api.ts) y se validan (ruta de
 * revalidación). El API de Armio construye las mismas cadenas al pedir la invalidación.
 */

export const PORTAL_INDEX_TAG = "portal:index";
export const portalTag = (slug: string) => `portal:${slug}`;
export const propertyTag = (slug: string, code: number) => `portal:${slug}:prop:${code}`;

const MAX_TAG_LENGTH = 256;
// Slug con el mismo formato que usan el API y las rutas de leads/sitemap (más permisivo que isPortalSlug
// a propósito, para cubrir slugs antiguos). "index" queda fuera: `portal:index` es la etiqueta del índice.
const TAG = /^portal:([a-z0-9-]{1,100})(?::prop:[1-9]\d{0,8})?$/;

/** Solo se aceptan etiquetas del portal; cualquier otra (p. ej. de Next o de marketing) se rechaza. */
export function isAllowedPortalTag(tag: string): boolean {
  if (typeof tag !== "string" || tag.length > MAX_TAG_LENGTH) return false;
  if (tag === PORTAL_INDEX_TAG) return true;
  const match = TAG.exec(tag);
  return match !== null && match[1] !== "index";
}
