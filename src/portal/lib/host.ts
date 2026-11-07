import { RESERVED_SLUGS } from "./reserved-slugs";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Slug válido de tenant: minúsculas, números y guiones simples; 3 a 30 caracteres. */
export function isValidPortalSlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 30 && SLUG_PATTERN.test(slug);
}

/** Slug que puede servirse como subdominio de portal (válido y no reservado). */
export function isPortalSlug(slug: string): boolean {
  return isValidPortalSlug(slug) && !RESERVED_SLUGS.has(slug);
}

/** Minúsculas, sin puerto ni punto final. */
export function hostnameOf(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

export type HostKind =
  | { kind: "root" }
  /** Subdominio del dominio raíz que NO es portal (www, app, reservado o inválido). */
  | { kind: "other-subdomain"; label: string }
  | { kind: "portal"; slug: string }
  /** Host ajeno al dominio raíz (previews de Vercel, IP, etc.). */
  | { kind: "foreign" };

/**
 * Clasifica un host respecto al dominio raíz del portal. `rootDomain` puede traer puerto
 * (`localhost:3000`); el puerto se ignora en ambos lados.
 */
export function classifyHost(host: string | null | undefined, rootDomain: string): HostKind {
  if (!host) return { kind: "foreign" };
  const hostname = hostnameOf(host);
  const root = hostnameOf(rootDomain);
  if (hostname === root) return { kind: "root" };
  if (!hostname.endsWith(`.${root}`)) return { kind: "foreign" };
  const label = hostname.slice(0, -(root.length + 1));
  // Solo un nivel: `a.b.armio.co` no es un portal
  if (label.includes(".") || !isPortalSlug(label)) return { kind: "other-subdomain", label };
  return { kind: "portal", slug: label };
}

/** Slug del portal si el host es `{slug}.{root}` válido y no reservado; si no, `null`. */
export function extractPortalSlug(
  host: string | null | undefined,
  rootDomain: string
): string | null {
  const result = classifyHost(host, rootDomain);
  return result.kind === "portal" ? result.slug : null;
}
