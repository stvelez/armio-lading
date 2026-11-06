import type { PortalFilters } from "../types";

export const ORDENES = ["recientes", "precio_asc", "precio_desc", "destacadas"] as const;
export const ORDEN_LABELS: Record<(typeof ORDENES)[number], string> = {
  recientes: "Más recientes",
  precio_asc: "Menor precio",
  precio_desc: "Mayor precio",
  destacadas: "Destacadas",
};

export const PAGE_SIZE = 12;
const MAX_AMOUNT = 9_999_999_999_999;

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

function int(value: string | undefined, min: number, max: number): number | undefined {
  if (value === undefined || !/^\d{1,14}$/.test(value)) return undefined;
  const n = Number(value);
  return n >= min && n <= max ? n : undefined;
}

/**
 * Convierte `searchParams` en filtros válidos. Todo lo inválido se descarta: el API rechaza (400)
 * parámetros desconocidos o fuera de rango, y aquí no se reenvía nada que no se haya validado.
 */
export function parseFilters(raw: RawParams): PortalFilters {
  const filters: PortalFilters = {};

  const operacion = first(raw.operacion);
  if (operacion === "arriendo" || operacion === "venta") filters.operacion = operacion;

  const tipo = first(raw.tipo);
  if (tipo && /^[a-z0-9-]{1,60}$/.test(tipo)) filters.tipo = tipo;

  const ciudad = first(raw.ciudad);
  if (ciudad && /^\d{1,10}$/.test(ciudad)) filters.ciudad = ciudad;

  const barrio = first(raw.barrio)?.trim();
  if (barrio && barrio.length <= 100) filters.barrio = barrio;

  const min = int(first(raw.precio_min), 0, MAX_AMOUNT);
  const max = int(first(raw.precio_max), 0, MAX_AMOUNT);
  if (min !== undefined) filters.precio_min = min;
  if (max !== undefined && (min === undefined || min <= max)) filters.precio_max = max;

  const habitaciones = int(first(raw.habitaciones_min), 0, 10);
  if (habitaciones !== undefined) filters.habitaciones_min = habitaciones;
  const banos = int(first(raw.banos_min), 0, 10);
  if (banos !== undefined) filters.banos_min = banos;

  const orden = first(raw.orden);
  if (orden && (ORDENES as readonly string[]).includes(orden)) {
    filters.orden = orden as PortalFilters["orden"];
  }

  const page = int(first(raw.page), 1, 100000);
  if (page !== undefined && page > 1) filters.page = page;

  return filters;
}

export function toQuery(
  filters: PortalFilters,
  extra: Record<string, string | number> = {}
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  for (const [key, value] of Object.entries(extra)) params.set(key, String(value));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Filtros que cambian el contenido más allá de operación y página: esas combinaciones no se indexan. */
export function hasNonCanonicalFilters(filters: PortalFilters): boolean {
  return Boolean(
    filters.tipo ||
    filters.ciudad ||
    filters.barrio ||
    filters.precio_min !== undefined ||
    filters.precio_max !== undefined ||
    filters.habitaciones_min !== undefined ||
    filters.banos_min !== undefined ||
    filters.orden
  );
}

export function hasAnyFilter(filters: PortalFilters): boolean {
  return hasNonCanonicalFilters(filters) || Boolean(filters.operacion);
}
