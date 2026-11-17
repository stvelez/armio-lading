/**
 * Cabeceras de seguridad de la landing (fuente ÚNICA: `next.config.ts` las emite y `vercel.json`
 * ya no declara ninguna, para que no se pisen entre sí).
 *
 * CSP — decisión: enforcing con `'unsafe-inline'` en `script-src`, SIN nonce.
 *
 * Un nonce por request obliga a que TODA página sea dinámica (Next inyecta el nonce durante el
 * render): se pierden ISR y la caché de CDN en las páginas del portal (`revalidate: 300`/`3600` en
 * `src/portal/lib/api.ts`), y hay una guardia que exige que sigan siendo estáticas/ISR
 * (`tests/unit/portal-pages-static.test.ts`). Además las páginas de marketing se prerenderizan
 * (`○` en `next build`), así que tampoco recibirían nonce. Con la landing sirviendo fichas de
 * inmuebles con ISR, el coste es peor que el beneficio.
 *
 * Por eso el script-src enforcing incluye `'unsafe-inline'` (deuda documentada en README) y se
 * emite además una política `Content-Security-Policy-Report-Only` con el `script-src` estricto
 * (sin `'unsafe-inline'`) como objetivo de migración: no bloquea nada y permite medir, en staging
 * o en DevTools, cuántos scripts inline de Next/terceros habría que noncear antes de dar el salto.
 * No lleva `report-uri`: no queremos enviar datos a terceros (coherente con la política de privacidad).
 *
 * Terceros verificados en `src/`:
 * - Turnstile (`src/portal/lib/turnstile.ts`): script, iframe y conexiones a challenges.cloudflare.com.
 * - OpenStreetMap (`src/portal/components/PropertyMap.tsx`): iframe de openstreetmap.org (+ tiles).
 * - Sentry (`src/instrumentation-client.ts`): envío directo a *.ingest.sentry.io (sin tunnel propio).
 * - GA4 (`src/components/providers/AnalyticsGate.tsx`): gtag.js en googletagmanager.com y envío a
 *   google-analytics.com; solo se monta en marketing y tras consentimiento.
 * - Imágenes: R2 (*.r2.dev), media.armio.co y Cloudinary van directas al origen cuando son
 *   `unoptimized` (`src/portal/lib/format.ts`), por eso están en `img-src`.
 * - YouTube/Vimeo: `src/components/ui/DemoVideo.tsx` soporta embeds, pero hoy nadie le pasa
 *   `videoSrc`. Si se usa, hay que añadir su origen a `frame-src` (ver README).
 */

export interface SecurityHeadersOptions {
  /** Solo para tests o usos puntuales; por defecto deriva de NODE_ENV. */
  isDev?: boolean;
}

interface Header {
  key: string;
  value: string;
}

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
const OSM_ORIGIN = "https://www.openstreetmap.org";

/** Orígenes de terceros realmente usados por el código (ver comentario de cabecera). */
const THIRD_PARTY = {
  gaScript: "https://www.googletagmanager.com",
  gaCollect: ["https://www.google-analytics.com", "https://*.google-analytics.com"],
  sentry: ["https://*.ingest.sentry.io", "https://*.sentry.io"],
  api: ["https://api.armio.co", "https://armio-api-staging.up.railway.app"],
  images: [
    "https://*.r2.dev",
    "https://*.armio.co",
    "https://*.tile.openstreetmap.org",
    "https://res.cloudinary.com",
  ],
} as const;

function resolveDev(options: SecurityHeadersOptions): boolean {
  return options.isDev ?? process.env.NODE_ENV !== "production";
}

type Directive = [name: string, values: string[]];

function directives(
  options: SecurityHeadersOptions,
  { strictScripts }: { strictScripts: boolean }
): Directive[] {
  const isDev = resolveDev(options);
  // `upgrade-insecure-requests` no aplica en una política Report-Only (el navegador la ignora y
  // deja un error en consola), así que solo va en la enforcing.
  const reportOnly = strictScripts;

  const scriptSrc = [
    "'self'",
    ...(strictScripts ? [] : ["'unsafe-inline'"]),
    TURNSTILE_ORIGIN,
    THIRD_PARTY.gaScript,
    // React usa eval en desarrollo para reconstruir stack traces; en producción no hace falta.
    ...(isDev ? ["'unsafe-eval'"] : []),
  ];

  const connectSrc = [
    "'self'",
    ...THIRD_PARTY.api,
    ...THIRD_PARTY.sentry,
    TURNSTILE_ORIGIN,
    THIRD_PARTY.gaScript,
    ...THIRD_PARTY.gaCollect,
    // HMR y API local solo en desarrollo.
    ...(isDev ? ["ws:", "http://localhost:*", "http://127.0.0.1:*"] : []),
  ];

  return [
    ["default-src", ["'self'"]],
    ["script-src", scriptSrc],
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:", "blob:", ...THIRD_PARTY.images]],
    ["font-src", ["'self'", "data:"]],
    ["connect-src", connectSrc],
    ["frame-src", ["'self'", TURNSTILE_ORIGIN, OSM_ORIGIN]],
    ["frame-ancestors", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["object-src", ["'none'"]],
    // En dev hay API local por HTTP y HMR por ws; en producción todo va por HTTPS.
    ...(isDev || reportOnly ? [] : [["upgrade-insecure-requests", []] as Directive]),
  ];
}

function serialize(entries: Directive[]): string {
  return entries.map(([name, values]) => [name, ...values].join(" ")).join("; ");
}

/** CSP enforcing: la que realmente se aplica en producción. */
export function buildContentSecurityPolicy(options: SecurityHeadersOptions = {}): string {
  return serialize(directives(options, { strictScripts: false }));
}

/**
 * CSP de solo reporte: mismo objetivo que la enforcing pero con `script-src` sin `'unsafe-inline'`
 * y sin `upgrade-insecure-requests` (el navegador ignora esa directiva en Report-Only).
 * Es la meta a la que se llegará con nonces; hoy solo sirve de diagnóstico.
 */
export function buildReportOnlyContentSecurityPolicy(options: SecurityHeadersOptions = {}): string {
  return serialize(directives(options, { strictScripts: true }));
}

/** Cabeceras de seguridad que `next.config.ts` aplica a todas las rutas. */
export function securityHeaders(options: SecurityHeadersOptions = {}): Header[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
    {
      key: "Content-Security-Policy-Report-Only",
      value: buildReportOnlyContentSecurityPolicy(options),
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      // geolocation cerrado: el mapa es un iframe con bbox fijo y el sitio no usa la API del
      // navegador. payment/usb no se usan. interest-cohort/browsing-topics: sin Topics API.
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
    },
    // Vercel sirve y redirige todo a HTTPS con certificados automáticos; HSTS lo fija en el navegador.
    // `preload` se omite: exige auditar TODOS los subdominios y salir de la lista tarda meses.
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ];
}
