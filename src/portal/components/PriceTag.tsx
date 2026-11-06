import type { PortalPurposeSlug } from "../types";
import { formatPrice } from "../lib/format";

interface Props {
  purpose: PortalPurposeSlug;
  price: number;
  currency: string;
  adminFee?: number | null;
  adminIncluded?: boolean;
  size?: "sm" | "lg";
}

export const BOTH_NOTE = "Consulta el valor de arriendo o de venta con la inmobiliaria";

/**
 * Propiedades `both`: un solo precio sin rotular según el filtro, con la nota de consulta.
 * `/mes` solo en arriendo.
 */
export default function PriceTag({
  purpose,
  price,
  currency,
  adminFee,
  adminIncluded,
  size = "sm",
}: Props) {
  const main = size === "lg" ? "text-3xl" : "text-xl";
  return (
    <div>
      <p className={`${main} font-bold text-stone-900`}>
        {price > 0 ? formatPrice(price, currency) : "Consultar precio"}
        {purpose === "rent" && price > 0 && (
          <span className="ml-1 text-sm font-medium text-stone-600">/mes</span>
        )}
      </p>
      {purpose === "both" && <p className="mt-0.5 text-xs text-stone-600">{BOTH_NOTE}</p>}
      {adminIncluded ? (
        <p className="mt-0.5 text-xs text-stone-600">Administración incluida</p>
      ) : adminFee ? (
        <p className="mt-0.5 text-xs text-stone-600">
          + {formatPrice(adminFee, currency)} de administración
        </p>
      ) : null}
    </div>
  );
}
