import type { PortalPurposeSlug } from "../types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://armio.co").replace(/\/$/, "");

/** Color por defecto de Armio, usado cuando el tenant no tiene (o tiene inválido) su color primario. */
export const DEFAULT_PRIMARY = "#00965E";

export const PRIVACY_CONSENT_VERSION = "1.0";

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

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Ruta relativa al portal del tenant. */
export function portalPath(tenant: string, sub = ""): string {
  return `/p/${tenant}${sub}`;
}

export function propertyPath(tenant: string, code: number, slug: string): string {
  return `/p/${tenant}/propiedades/${code}-${slug}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
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

/** Número de WhatsApp para wa.me: solo dígitos; los celulares colombianos de 10 dígitos llevan 57. */
export function whatsappNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("3")) digits = `57${digits}`;
  return digits.length >= 8 ? digits : null;
}

export function telHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const clean = raw.replace(/[^\d+]/g, "");
  return clean.replace(/\D/g, "").length >= 6 ? `tel:${clean}` : null;
}

export function whatsappHref(raw: string | null | undefined, text: string): string | null {
  const number = whatsappNumber(raw);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

/** JSON para `<script type="application/ld+json">`: `<` escapado para que no pueda cerrar la etiqueta. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
