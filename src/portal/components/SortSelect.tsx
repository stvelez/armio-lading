"use client";

import { useRouter } from "next/navigation";
import { useId, useRef } from "react";
import type { PortalFilters } from "../types";
import { ORDEN_LABELS, ORDENES, toQuery } from "../lib/filters";

interface Props {
  /** Ruta del listado, p. ej. `/propiedades`. */
  basePath: string;
  /** Filtros vigentes: el orden se cambia sin perderlos ni volver a la primera página. */
  filters?: PortalFilters;
}

/**
 * `.sort` del prototipo. Es un `<form method="get">`: con JS cambia la URL al elegir; sin JS queda el
 * botón «Ordenar». La URL sigue siendo la única fuente de verdad (nada se ordena en el cliente).
 */
export default function SortSelect({ basePath, filters = {} }: Props) {
  const router = useRouter();
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const { orden, page: _page, ...rest } = filters;
  void _page;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;
    router.push(
      `${basePath}${toQuery({ ...rest, ...(value ? { orden: value } : {}) } as PortalFilters)}`
    );
  }

  return (
    <form ref={form} className="sort" action={basePath} method="get">
      {Object.entries(rest).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}
      <label className="field-label" htmlFor={id}>
        Ordenar por
      </label>
      <select
        className="select"
        id={id}
        name="orden"
        defaultValue={orden ?? ""}
        onChange={onChange}
      >
        <option value="">Más recientes</option>
        {ORDENES.filter((o) => o !== "recientes").map((o) => (
          <option key={o} value={o}>
            {ORDEN_LABELS[o]}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="btn btn-secondary">
          Ordenar
        </button>
      </noscript>
    </form>
  );
}
