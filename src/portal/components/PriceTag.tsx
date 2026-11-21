import type { PortalPurposeSlug } from "../types";
import { formatPrice } from "../lib/format";

interface Props {
  purpose: PortalPurposeSlug;
  price: number;
  /** Canon mensual; en `both`, `price` es el precio de venta. */
  rentPrice?: number | null;
  /** Operación activa en el filtro; en arriendo se muestra primero el canon. */
  operacion?: "arriendo" | "venta";
  currency: string;
  adminFee?: number | null;
  adminIncluded?: boolean;
  size?: "sm" | "lg";
}

export const BOTH_NOTE = "Consulta el valor de arriendo o de venta con la inmobiliaria";

/**
 * Propiedades `both` con `rentPrice`: dos líneas (Venta / Arriendo), primero la de la
 * operación filtrada. Sin `rentPrice`: un precio sin rotular con la nota de consulta.
 * `/mes` solo en arriendo.
 */
export default function PriceTag({
  purpose,
  price,
  rentPrice,
  operacion,
  currency,
  adminFee,
  adminIncluded,
  size = "sm",
}: Props) {
  const main = size === "lg" ? "text-3xl" : "text-xl";
  const hasRent = typeof rentPrice === "number" && rentPrice > 0;
  const dual = purpose === "both" && hasRent;
  const rows = dual
    ? [
        { key: "rent", label: "Arriendo", value: rentPrice as number, perMonth: true },
        { key: "sale", label: "Venta", value: price, perMonth: false },
      ]
    : [];
  if (operacion !== "arriendo") rows.reverse();
  return (
    <div>
      {dual ? (
        <div className="space-y-0.5">
          {rows.map((row, i) => (
            <p key={row.key} className="flex items-baseline gap-2">
              <span className="w-16 shrink-0 text-xs font-medium text-[var(--portal-muted)]">
                {row.label}
              </span>
              <span
                className={`${i === 0 ? main : "text-base"} font-bold text-[var(--portal-text)]`}
              >
                {row.value > 0 ? formatPrice(row.value, currency) : "Consultar precio"}
                {row.perMonth && row.value > 0 && (
                  <span className="ml-1 text-sm font-medium text-[var(--portal-muted)]">/mes</span>
                )}
              </span>
            </p>
          ))}
        </div>
      ) : (
        <p className={`${main} font-bold text-[var(--portal-text)]`}>
          {price > 0 ? formatPrice(price, currency) : "Consultar precio"}
          {purpose === "rent" && price > 0 && (
            <span className="ml-1 text-sm font-medium text-[var(--portal-muted)]">/mes</span>
          )}
        </p>
      )}
      {purpose === "both" && !dual && (
        <p className="mt-0.5 text-xs text-[var(--portal-muted)]">{BOTH_NOTE}</p>
      )}
      {adminIncluded ? (
        <p className="mt-0.5 text-xs text-[var(--portal-muted)]">Administración incluida</p>
      ) : adminFee ? (
        <p className="mt-0.5 text-xs text-[var(--portal-muted)]">
          + {formatPrice(adminFee, currency)} de administración
        </p>
      ) : null}
    </div>
  );
}
