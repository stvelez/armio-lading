import { hostnameOf } from "./host";

/**
 * Única fuente de URLs del portal.
 *
 * La URL pública y oficial de un portal es `https://{slug}.{PORTAL_ROOT_DOMAIN}`.
 * La ruta `/p/{slug}/...` es INTERNA (destino de la reescritura de `src/proxy.ts`) y está
 * DEPRECADA como URL pública: nada de lo que se genera aquí debe contener `/p/`.
 */

export const DEFAULT_ROOT_DOMAIN = "armio.co";

/** Dominio raíz (puede incluir puerto en local, p. ej. `localhost:3000`). */
export function portalRootDomain(): string {
  const raw = process.env.NEXT_PUBLIC_PORTAL_ROOT_DOMAIN?.trim().toLowerCase();
  return raw ? raw.replace(/\/+$/, "") : DEFAULT_ROOT_DOMAIN;
}

/** `localhost` y `*.localhost` se sirven por http; todo lo demás por https. */
export function isLocalRoot(rootDomain: string = portalRootDomain()): boolean {
  const hostname = hostnameOf(rootDomain);
  return hostname === "localhost" || hostname.endsWith(".localhost");
}

export function portalOrigin(slug: string): string {
  const root = portalRootDomain();
  return `${isLocalRoot(root) ? "http" : "https"}://${slug}.${root}`;
}

/** URL absoluta en el subdominio del tenant. `path` empieza con `/` (o vacío para el inicio). */
export function portalUrl(slug: string, path = ""): string {
  return `${portalOrigin(slug)}${path}`;
}

/** Ruta RELATIVA a la raíz del subdominio (el visitante ya navega en `{slug}.dominio`). */
export function portalPath(sub = ""): string {
  return sub || "/";
}

export function propertyPath(code: number, slug: string): string {
  return `/propiedades/${code}-${slug}`;
}
