/**
 * Clasificador de origen de las visitas del portal y saneado de UTM. Puro y compartido por el navegador
 * (`VisitBeacon`) y la ruta `/api/portal/visits`. La URL del referrer nunca sale del navegador: al servidor
 * solo llega la categoría. Ver armio-api/docs/PORTAL_ANALYTICS_PLAN.md §3.3.
 */

export const VISIT_PAGES = ["home", "listing", "property"] as const;
export type VisitPage = (typeof VISIT_PAGES)[number];

export const VISIT_SOURCES = [
  "directo",
  "buscador",
  "whatsapp",
  "facebook",
  "instagram",
  "otro_sitio",
  "interno",
] as const;
export type VisitSource = (typeof VISIT_SOURCES)[number];

/** Misma lista que el API (`BOT_UA` en armio-api). */
export const BOT_UA =
  /\b(?!cubot)[a-z0-9]*bot\b|_bot\b|crawl|spider|slurp|bingpreview|facebookexternalhit|facebot|whatsapp|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|embedly|pinterest|headlesschrome|lighthouse|pagespeed|chrome-lighthouse|gtmetrix|python-requests|curl|wget|httpclient|okhttp|axios|node-fetch|go-http-client|java\//i;

export const UTM_FORMAT = /^[a-z0-9][a-z0-9._-]{0,39}$/;

/** UTM saneada (minúsculas, espacios → guion) o `null` si no es una etiqueta segura (posibles correos, teléfonos, rutas, HTML…). */
export function sanitizeUtm(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase().replace(/\s+/g, "-");
  if (!UTM_FORMAT.test(text)) return null;
  // Solo dígitos y 7 o más: podría ser un teléfono
  if (/^\d{7,}$/.test(text)) return null;
  return text;
}

const UTM_SOURCES: Record<string, VisitSource> = {
  whatsapp: "whatsapp",
  wa: "whatsapp",
  facebook: "facebook",
  fb: "facebook",
  meta: "facebook",
  instagram: "instagram",
  ig: "instagram",
  google: "buscador",
  bing: "buscador",
  duckduckgo: "buscador",
  yahoo: "buscador",
  ecosia: "buscador",
  brave: "buscador",
};

const ANDROID_APPS: Record<string, VisitSource> = {
  "com.whatsapp": "whatsapp",
  "com.whatsapp.w4b": "whatsapp",
  "com.facebook.katana": "facebook",
  "com.facebook.orca": "facebook",
  "com.instagram.android": "instagram",
  "com.google.android.googlequicksearchbox": "buscador",
};

/** Google en cualquier país: google.com, google.com.co, google.co.uk, google.es… (etiquetas completas, nunca `includes`). */
const GOOGLE = /^(.+\.)?google\.(com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/;

const SEARCH_DOMAINS = [
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.com",
  "yandex.ru",
  "yandex.com",
  "ecosia.org",
  "search.brave.com",
];
const WHATSAPP_DOMAINS = ["whatsapp.com", "wa.me", "whatsapp.net"];
const FACEBOOK_DOMAINS = ["facebook.com", "fb.com", "fb.me", "messenger.com"];
const INSTAGRAM_DOMAINS = ["instagram.com"];

/** `host` es el dominio o un subdominio suyo (por etiquetas completas). */
const within = (host: string, domains: string[]) =>
  domains.some((d) => host === d || host.endsWith(`.${d}`));

const normalizeHost = (host: string) =>
  host.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");

/**
 * Categoría de origen de una visita. Precedencia: UTM reconocida, referrer vacío/ilegible (directo),
 * apps de Android, esquemas no web, mismo host (interno), buscadores/redes por dominio y, por último, otro sitio.
 */
export function classifyVisitSource(
  referrer: string | null | undefined,
  currentHost: string,
  utmSource?: string | null
): VisitSource {
  const utm = sanitizeUtm(utmSource);
  if (utm && UTM_SOURCES[utm]) return UTM_SOURCES[utm];

  const raw = (referrer ?? "").trim();
  if (!raw) return "directo";

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "directo";
  }

  const host = normalizeHost(url.hostname);
  if (url.protocol === "android-app:") return ANDROID_APPS[host] ?? "otro_sitio";
  if (url.protocol !== "http:" && url.protocol !== "https:") return "otro_sitio";
  if (!host) return "directo";
  if (host === normalizeHost(currentHost)) return "interno";

  if (GOOGLE.test(host) || within(host, SEARCH_DOMAINS)) return "buscador";
  if (within(host, WHATSAPP_DOMAINS)) return "whatsapp";
  if (within(host, FACEBOOK_DOMAINS)) return "facebook";
  if (within(host, INSTAGRAM_DOMAINS)) return "instagram";
  return "otro_sitio";
}
