import Link from "next/link";
import type { PortalFilters, PortalProfile } from "../types";
import { toQuery } from "../lib/filters";
import { formatPrice } from "../lib/format";
import Icon from "./Icon";

interface Props {
  basePath: string;
  filters: PortalFilters;
  facets: PortalProfile["facets"];
}

interface Chip {
  key: Exclude<keyof PortalFilters, "page">;
  label: string;
}

function chipsOf(filters: PortalFilters, facets: PortalProfile["facets"]): Chip[] {
  const chips: Chip[] = [];
  if (filters.operacion) {
    chips.push({
      key: "operacion",
      label: filters.operacion === "arriendo" ? "Arriendo" : "Venta",
    });
  }
  if (filters.tipo) {
    chips.push({
      key: "tipo",
      label: facets.types.find((t) => t.slug === filters.tipo)?.name ?? filters.tipo,
    });
  }
  if (filters.ciudad) {
    chips.push({
      key: "ciudad",
      label: facets.cities.find((c) => c.code === filters.ciudad)?.name ?? "Ciudad",
    });
  }
  if (filters.barrio) chips.push({ key: "barrio", label: filters.barrio });
  if (filters.precio_min !== undefined) {
    chips.push({ key: "precio_min", label: `Desde ${formatPrice(filters.precio_min)}` });
  }
  if (filters.precio_max !== undefined) {
    chips.push({ key: "precio_max", label: `Hasta ${formatPrice(filters.precio_max)}` });
  }
  if (filters.habitaciones_min !== undefined) {
    chips.push({ key: "habitaciones_min", label: `${filters.habitaciones_min}+ hab.` });
  }
  if (filters.banos_min !== undefined) {
    chips.push({ key: "banos_min", label: `${filters.banos_min}+ baños` });
  }
  return chips;
}

/**
 * `.list-tools` del prototipo: un chip por filtro activo. Cada chip es un enlace que quita ese filtro
 * (la URL es la fuente de verdad, nada se filtra en el cliente).
 */
export default function FilterChips({ basePath, filters, facets }: Props) {
  const chips = chipsOf(filters, facets);
  const { page: _page, ...rest } = filters;
  void _page;
  const without = (key: Chip["key"]) => {
    const next = { ...rest };
    delete next[key];
    return `${basePath}${toQuery(next)}`;
  };

  if (chips.length === 0) return null;
  return (
    <div className="list-tools">
      <span className="list-tools-label">Filtros:</span>
      <span className="od-cluster" style={{ "--od-gap": "8px" } as React.CSSProperties}>
        {chips.map((chip) => (
          <Link
            key={chip.key}
            className="chip"
            href={without(chip.key)}
            aria-label={`Quitar filtro ${chip.label}`}
          >
            {chip.label}
            <Icon name="close" strokeWidth={2.2} />
          </Link>
        ))}
      </span>
      {chips.length >= 2 && (
        <Link className="btn btn-quiet" href={basePath}>
          Quitar filtros
        </Link>
      )}
    </div>
  );
}
