"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import { Search } from "lucide-react";
import type { PortalFilters, PortalProfile } from "../types";
import { ORDEN_LABELS, ORDENES, toQuery } from "../lib/filters";

interface Props {
  /** Ruta del listado, p. ej. `/p/mi-agencia/propiedades`. */
  basePath: string;
  filters: PortalFilters;
  facets: PortalProfile["facets"];
  /** Se llama tras aplicar los filtros (cierra la hoja en móvil). */
  onApplied?: () => void;
}

const field =
  "h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400";
const label = "mb-1 block text-sm font-medium text-stone-800";

/**
 * Filtros del listado. Es un `<form method="get">`, así que funciona sin JS; con JS actualiza la URL
 * sin recargar. Los nombres de los campos son los del API.
 */
export default function FiltersBar({ basePath, filters, facets, onApplied }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const id = useId();
  const f = (name: string) => `${id}-${name}`;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, raw] of data.entries()) {
      let value = String(raw).trim();
      if (key === "precio_min" || key === "precio_max") value = value.replace(/\D/g, "");
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${basePath}?${qs}` : basePath);
      onApplied?.();
    });
  }

  const numberOptions = (max: number) => Array.from({ length: max }, (_, i) => i + 1);

  return (
    <form
      action={basePath}
      method="get"
      onSubmit={onSubmit}
      className="space-y-4"
      aria-busy={pending}
    >
      <div>
        <label htmlFor={f("operacion")} className={label}>
          Operación
        </label>
        <select
          id={f("operacion")}
          name="operacion"
          defaultValue={filters.operacion ?? ""}
          className={field}
        >
          <option value="">Arriendo y venta</option>
          <option value="arriendo">Arriendo</option>
          <option value="venta">Venta</option>
        </select>
      </div>
      <div>
        <label htmlFor={f("tipo")} className={label}>
          Tipo de inmueble
        </label>
        <select id={f("tipo")} name="tipo" defaultValue={filters.tipo ?? ""} className={field}>
          <option value="">Todos</option>
          {facets.types.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name} ({t.count})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={f("ciudad")} className={label}>
          Ciudad
        </label>
        <select
          id={f("ciudad")}
          name="ciudad"
          defaultValue={filters.ciudad ?? ""}
          className={field}
        >
          <option value="">Todas</option>
          {facets.cities.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={f("barrio")} className={label}>
          Barrio
        </label>
        <input
          id={f("barrio")}
          name="barrio"
          list={f("barrios")}
          defaultValue={filters.barrio ?? ""}
          maxLength={100}
          placeholder="Ej. Laureles"
          autoComplete="off"
          className={field}
        />
        <datalist id={f("barrios")}>
          {facets.neighborhoods.map((n) => (
            <option key={n.name} value={n.name} />
          ))}
        </datalist>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={f("pmin")} className={label}>
            Precio mínimo
          </label>
          <input
            id={f("pmin")}
            name="precio_min"
            inputMode="numeric"
            defaultValue={filters.precio_min ?? ""}
            placeholder="$ 0"
            className={field}
          />
        </div>
        <div>
          <label htmlFor={f("pmax")} className={label}>
            Precio máximo
          </label>
          <input
            id={f("pmax")}
            name="precio_max"
            inputMode="numeric"
            defaultValue={filters.precio_max ?? ""}
            placeholder="Sin tope"
            className={field}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={f("hab")} className={label}>
            Habitaciones
          </label>
          <select
            id={f("hab")}
            name="habitaciones_min"
            defaultValue={filters.habitaciones_min ?? ""}
            className={field}
          >
            <option value="">Cualquiera</option>
            {numberOptions(6).map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={f("banos")} className={label}>
            Baños
          </label>
          <select
            id={f("banos")}
            name="banos_min"
            defaultValue={filters.banos_min ?? ""}
            className={field}
          >
            <option value="">Cualquiera</option>
            {numberOptions(5).map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={f("orden")} className={label}>
          Ordenar por
        </label>
        <select id={f("orden")} name="orden" defaultValue={filters.orden ?? ""} className={field}>
          <option value="">Más recientes</option>
          {ORDENES.filter((o) => o !== "recientes").map((o) => (
            <option key={o} value={o}>
              {ORDEN_LABELS[o]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          className="bg-portal text-on-portal inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 font-semibold disabled:opacity-60"
          disabled={pending}
        >
          <Search className="h-4 w-4" aria-hidden /> {pending ? "Buscando…" : "Buscar"}
        </button>
        {toQuery(filters) !== "" && (
          <Link
            href={basePath}
            onClick={onApplied}
            className="text-sm font-medium text-stone-700 underline"
          >
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}
