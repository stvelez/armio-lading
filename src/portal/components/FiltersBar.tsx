"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import type { PortalFilters, PortalProfile } from "../types";
import { toQuery } from "../lib/filters";
import Icon from "./Icon";

interface Props {
  /** Ruta del listado, p. ej. `/propiedades` (relativa al subdominio). */
  basePath: string;
  filters: PortalFilters;
  facets: PortalProfile["facets"];
  /** Se llama tras aplicar los filtros (cierra la hoja en móvil). */
  onApplied?: () => void;
}

const OPERATIONS = [
  { value: "", label: "Todas" },
  { value: "arriendo", label: "Arriendo" },
  { value: "venta", label: "Venta" },
] as const;

/**
 * Filtros del listado con los controles del prototipo (`.seg`, `.select`, `.input`). Es un
 * `<form method="get">`, así que funciona sin JS; con JS actualiza la URL sin recargar. Los nombres
 * de los campos son los del API.
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
  const operation = filters.operacion ?? "";
  // La página siempre vuelve a la primera al cambiar filtros; el orden se conserva.
  const hasFilters = toQuery({ ...filters, page: undefined, orden: undefined }) !== "";

  return (
    <form className="form" action={basePath} method="get" onSubmit={onSubmit} aria-busy={pending}>
      {filters.orden && <input type="hidden" name="orden" value={filters.orden} />}
      <div className="field">
        <span className="field-label" id={f("operacion")}>
          Operación
        </span>
        <fieldset className="seg" aria-labelledby={f("operacion")}>
          {OPERATIONS.map((op) => (
            <label key={op.value || "todas"}>
              <input
                type="radio"
                name="operacion"
                value={op.value}
                defaultChecked={operation === op.value}
              />
              <span>{op.label}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <div className="field">
        <label htmlFor={f("tipo")}>Tipo de inmueble</label>
        <select id={f("tipo")} className="select" name="tipo" defaultValue={filters.tipo ?? ""}>
          <option value="">Todos</option>
          {facets.types.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name} ({t.count})
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={f("ciudad")}>Ciudad</label>
        <select
          id={f("ciudad")}
          className="select"
          name="ciudad"
          defaultValue={filters.ciudad ?? ""}
        >
          <option value="">Todas</option>
          {facets.cities.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={f("barrio")}>Barrio</label>
        <input
          id={f("barrio")}
          className="input"
          name="barrio"
          list={f("barrios")}
          defaultValue={filters.barrio ?? ""}
          maxLength={100}
          placeholder="Ej. Laureles"
          autoComplete="off"
        />
        <datalist id={f("barrios")}>
          {facets.neighborhoods.map((n) => (
            <option key={n.name} value={n.name} />
          ))}
        </datalist>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor={f("pmin")}>Precio mínimo</label>
          <input
            id={f("pmin")}
            className="input"
            name="precio_min"
            inputMode="numeric"
            defaultValue={filters.precio_min ?? ""}
            placeholder="$ 0"
          />
        </div>
        <div className="field">
          <label htmlFor={f("pmax")}>Precio máximo</label>
          <input
            id={f("pmax")}
            className="input"
            name="precio_max"
            inputMode="numeric"
            defaultValue={filters.precio_max ?? ""}
            placeholder="Sin tope"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor={f("hab")}>Habitaciones</label>
          <select
            id={f("hab")}
            className="select"
            name="habitaciones_min"
            defaultValue={filters.habitaciones_min ?? ""}
          >
            <option value="">Cualquiera</option>
            {numberOptions(6).map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={f("banos")}>Baños</label>
          <select
            id={f("banos")}
            className="select"
            name="banos_min"
            defaultValue={filters.banos_min ?? ""}
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
      <div className="filters-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          <Icon name="search" /> {pending ? "Buscando…" : "Buscar"}
        </button>
        {hasFilters && (
          <Link
            className="btn btn-quiet"
            href={filters.orden ? `${basePath}${toQuery({ orden: filters.orden })}` : basePath}
            onClick={onApplied}
          >
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}
