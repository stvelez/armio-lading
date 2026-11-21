import type { PortalPurposeSlug } from "../types";

/** Color por defecto de Armio, usado cuando el tenant no tiene (o tiene inválido) su color primario. */
export const DEFAULT_PRIMARY = "#07544E";

/**
 * Versión del texto de consentimiento que vio la persona. Cada texto distinto lleva su propia
 * versión: es la evidencia de qué autorizó exactamente (Ley 1581).
 */
export const PRIVACY_CONSENT_VERSION = "2.0";
export const PRIVACY_CONSENT_VERSION_GENERAL = "2.1";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Devuelve el hex `#RRGGBB` solo si es válido; si no, el color de Armio. */
export function safeColor(value: string | null | undefined): string {
  return value && HEX.test(value) ? value.toUpperCase() : DEFAULT_PRIMARY;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

const DARK_TEXT = "#111827";

/** Blanco o casi negro, el que dé más contraste sobre el color dado. */
export function onColor(hex: string): string {
  const l = luminance(hex);
  const contrastWhite = 1.05 / (l + 0.05);
  // El texto oscuro es #111827 (no negro puro): su contraste se calcula con su propia luminancia
  const contrastDark = (l + 0.05) / (luminance(DARK_TEXT) + 0.05);
  return contrastWhite >= contrastDark ? "#FFFFFF" : DARK_TEXT;
}

const priceFormatter = new Intl.NumberFormat("es-CO");

export function formatPrice(value: number, currency = "COP"): string {
  const formatted = priceFormatter.format(Math.round(value));
  return currency === "COP" ? `$ ${formatted}` : `${currency} ${formatted}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);
}

/** `rent` | `sale` | `both` -> arriendo | venta | arriendo y venta */
export function operationLabel(purpose: PortalPurposeSlug): string {
  if (purpose === "rent") return "arriendo";
  if (purpose === "sale") return "venta";
  return "arriendo y venta";
}

/** Primera mención de la zona: la API a veces la entrega como «Granada, Cali» (zona + ciudad). */
export function zoneOf(loc: { area: string | null; city: string | null }): string {
  const area = loc.area?.split(",")[0]?.trim();
  return area || loc.city?.trim() || "";
}

/**
 * Título público de un inmueble: `Tipo en Operación, Zona` (p. ej. «Apartamento en Arriendo, San
 * Fernando»). Es el que ven tarjetas y ficha; el título libre del inmueble no se muestra.
 */
export function propertyHeading(p: {
  type: { name: string };
  purpose: { name: string };
  location: { area: string | null; city: string | null };
}): string {
  const operation = p.purpose.name.charAt(0).toUpperCase() + p.purpose.name.slice(1);
  const zone = zoneOf(p.location);
  return `${p.type.name} en ${operation}${zone ? `, ${zone}` : ""}`;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Solo acepta URLs https absolutas (para imágenes y enlaces que vienen de datos del tenant). */
export function httpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const OPTIMIZABLE_HOSTS = [/^media\.armio\.co$/, /^[^.]+\.r2\.dev$/, /^res\.cloudinary\.com$/];

/**
 * `next/image` lanza error si el host no está en `remotePatterns`; para hosts desconocidos
 * se sirve sin optimizar en vez de romper la página.
 */
export function imageProps(url: string): { src: string; unoptimized: boolean } {
  let unoptimized = true;
  try {
    const host = new URL(url).hostname;
    unoptimized = !OPTIMIZABLE_HOSTS.some((re) => re.test(host));
  } catch {
    /* url inválida: se deja sin optimizar */
  }
  return { src: url, unoptimized };
}

/**
 * Imagen para tarjetas y tiras de miniaturas. Si el API trae una miniatura WebP de nuestro propio
 * almacenamiento se sirve tal cual (`unoptimized`: ya viene del CDN, sin gastar transformaciones
 * de Vercel). Sin miniatura (API viejo, fotos antiguas, host desconocido) cae al original con la
 * optimización de siempre. Devuelve null si no hay ninguna URL https válida.
 */
export function thumbProps(
  img: { url: string; thumbnail_url?: string | null } | null | undefined
): { src: string; unoptimized: boolean } | null {
  if (!img) return null;
  const thumb = httpsUrl(img.thumbnail_url);
  if (thumb) {
    try {
      const host = new URL(thumb).hostname;
      if (OPTIMIZABLE_HOSTS.some((re) => re.test(host))) return { src: thumb, unoptimized: false };
    } catch {
      /* se usa el original */
    }
  }
  const original = httpsUrl(img.url);
  return original ? imageProps(original) : null;
}

/**
 * Número de WhatsApp para `wa.me`, o `null` si el número no puede tener WhatsApp.
 *
 * WhatsApp no opera sobre fijos: un `wa.me/601…` abre un enlace inválido. Solo se acepta un
 * celular colombiano (10 dígitos que empiezan por 3), el mismo con 57, o un internacional escrito
 * con `+`. Es la misma regla que aplica la API (`shared/utils/whatsapp.ts`): el portal nunca debe
 * inventar el indicativo de un número fijo.
 */
export function whatsappNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;
  let digits = text.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (text.startsWith("+")) {
    if (!/^\d{8,15}$/.test(digits)) return null;
    // Colombia siempre es +57 + 10 dígitos: un +57 corto es un número incompleto.
    if (digits.startsWith("57") && digits.length !== 12) return null;
    // +57 con un fijo sigue siendo un fijo.
    if (digits.length === 12 && digits.startsWith("57")) return digits[2] === "3" ? digits : null;
    return digits;
  }
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  if (digits.length === 12 && digits.startsWith("57")) return digits[2] === "3" ? digits : null;
  return null;
}

/**
 * Enlace telefónico en formato internacional. Los números colombianos escritos sin indicativo
 * (celular `3XX…` o fijo `60X…`) llevan `+57`; un número de 7 dígitos sin indicativo ya no se puede
 * marcar desde 2021 y se descarta.
 */
export function telHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;
  let digits = text.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (text.startsWith("+")) {
    if (digits.startsWith("57")) {
      return digits.length === 12 ? `tel:+${digits}` : null;
    }
    return digits.length >= 8 && digits.length <= 15 ? `tel:+${digits}` : null;
  }
  if (digits.length === 10 && /^[36]/.test(digits)) return `tel:+57${digits}`;
  if (digits.length === 12 && digits.startsWith("57")) return `tel:+${digits}`;
  return null;
}

export function whatsappHref(raw: string | null | undefined, text: string): string | null {
  const number = whatsappNumber(raw);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

/** Teléfono legible para mostrar: 300 123 4567 / 601 555 0101. */
export function formatPhoneDisplay(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  const national = digits.startsWith("57") && digits.length === 12 ? digits.slice(2) : digits;
  if (national.length === 10) {
    return `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }
  return raw;
}

/** ¿Los dos campos son el mismo número? Evita mostrar WhatsApp y Teléfono como canales distintos. */
export function samePhoneDigits(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const na = whatsappNumber(a);
  const nb = whatsappNumber(b) ?? (b ? b.replace(/\D/g, "") : null);
  if (!na || !nb) return false;
  return na.slice(-10) === nb.slice(-10);
}

/** JSON para `<script type="application/ld+json">`: `<` escapado para que no pueda cerrar la etiqueta. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
