import { NextResponse, type NextRequest } from "next/server";
import { classifyHost, isPortalSlug } from "@/portal/lib/host";
import { portalOrigin, portalRootDomain } from "@/portal/lib/urls";

/**
 * Enrutamiento por subdominio del portal público.
 *
 * - `{slug}.{ROOT}/x`  -> reescribe (sin redirigir) a `/p/{slug}/x`, conservando la query.
 * - `{ROOT}/p/{slug}/x` -> 301 a `https://{slug}.{ROOT}/x`.
 *
 * `/p/{slug}/...` es una ruta INTERNA, destino de la reescritura, y está DEPRECADA como URL
 * pública: la única URL oficial de un portal es su subdominio.
 */

const PORTAL_PREFIX = /^\/p\/([^/]+)(\/.*)?$/;

export function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const target = classifyHost(host?.split(",")[0], portalRootDomain());
  const { pathname, search } = request.nextUrl;

  if (target.kind === "portal") {
    // La API de leads existe una sola vez, fuera de /p: funciona igual desde cualquier host.
    if (pathname === "/api/portal" || pathname.startsWith("/api/portal/")) {
      return NextResponse.next();
    }
    const direct = PORTAL_PREFIX.exec(pathname);
    if (direct) {
      // Ya trae /p/...: no se reescribe dos veces (evita /p/x/p/x). Se lleva al subdominio
      // que corresponde, que evita servir a un tenant bajo el host de otro.
      const other = direct[1].toLowerCase();
      if (!isPortalSlug(other)) return new NextResponse("Not found", { status: 404 });
      return NextResponse.redirect(`${portalOrigin(other)}${direct[2] ?? "/"}${search}`, 301);
    }
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/p/${target.slug}` : `/p/${target.slug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Dominio raíz (y sus subdominios no-portal): /p/{slug}/... redirige al subdominio.
  // Un host que llegó por reescritura es siempre un subdominio de portal, así que nunca cae aquí.
  if (target.kind === "root" || (target.kind === "other-subdomain" && target.label === "www")) {
    const match = PORTAL_PREFIX.exec(pathname);
    if (match) {
      const slug = match[1].toLowerCase();
      if (isPortalSlug(slug)) {
        return NextResponse.redirect(`${portalOrigin(slug)}${match[2] ?? "/"}${search}`, 301);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluye assets de Next y archivos estáticos; deja pasar sitemap.xml y robots.txt.
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpe?g|gif|webp|avif|ico|woff2?|css|js|map|mp4|webm)$).*)",
  ],
};
