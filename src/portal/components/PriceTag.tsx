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
  /**
   * `sm`: bloque `.price` de tarjetas y destacada. `lg`: filas `.od-stat` para `.detail-prices` de la
   * ficha (el contenedor lo pone la página).
   */
  size?: "sm" | "lg";
}

export const BOTH_NOTE = "Consulta el valor de arriendo o de venta con la inmobiliaria";

interface Row {
  key: string;
  label: string;
  value: number;
  perMonth: boolean;
}

function Amount({
  value,
  currency,
  perMonth,
}: {
  value: number;
  currency: string;
  perMonth: boolean;
}) {
  if (!(value > 0)) return <>Consultar precio</>;
  return (
    <>
      {formatPrice(value, currency)}
      {perMonth && <small>/mes</small>}
    </>
  );
}

/**
 * Una sola jerarquía de precio según la operación. En `both` con `rentPrice` se muestran arriendo y
 * venta (primero la operación filtrada); sin `rentPrice`, un precio sin rotular y la nota de consulta.
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
  const hasRent = typeof rentPrice === "number" && rentPrice > 0;
  const dual = purpose === "both" && hasRent;

  let rows: Row[];
  if (dual) {
    rows = [
      { key: "rent", label: "Arriendo", value: rentPrice as number, perMonth: true },
      { key: "sale", label: "Venta", value: price, perMonth: false },
    ];
    if (operacion !== "arriendo") rows.reverse();
  } else if (purpose === "rent") {
    rows = [{ key: "rent", label: "Arriendo", value: price, perMonth: true }];
  } else if (purpose === "sale") {
    rows = [{ key: "sale", label: "Venta", value: price, perMonth: false }];
  } else {
    rows = [{ key: "price", label: "", value: price, perMonth: false }];
  }

  const notes = (
    <>
      {purpose === "both" && !dual && <span className="price-note">{BOTH_NOTE}</span>}
      {adminIncluded ? (
        <span className="price-note">Administración incluida</span>
      ) : adminFee ? (
        <span className="price-note">+ {formatPrice(adminFee, currency)} de administración</span>
      ) : null}
    </>
  );

  if (size === "lg") {
    return (
      <>
        {rows.map((row) => (
          <div className="od-stat" key={row.key}>
            {row.label && <span className="price-label">{row.label}</span>}
            <span className="price-main od-nowrap">
              <Amount value={row.value} currency={currency} perMonth={row.perMonth} />
            </span>
          </div>
        ))}
        {notes}
      </>
    );
  }

  const [main, ...rest] = rows;
  return (
    <div className="price">
      {main.label && <span className="price-label">{main.label}</span>}
      <span className="price-main od-nowrap">
        <Amount value={main.value} currency={currency} perMonth={main.perMonth} />
      </span>
      {rest.map((row) => (
        <span className="price-alt" key={row.key}>
          {row.label} <b>{row.value > 0 ? formatPrice(row.value, currency) : "Consultar precio"}</b>
          {row.perMonth && row.value > 0 ? " /mes" : ""}
        </span>
      ))}
      {notes}
    </div>
  );
}
