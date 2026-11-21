"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { PortalFilters, PortalProfile } from "../types";
import FiltersBar from "./FiltersBar";
import Icon from "./Icon";

interface Props {
  basePath: string;
  filters: PortalFilters;
  facets: PortalProfile["facets"];
  activeCount: number;
}

/** Hoja de filtros para móvil, con `<dialog>` nativo (`.modal.sheet`: foco atrapado y Esc para cerrar). */
export default function MobileFiltersSheet({ basePath, filters, facets, activeCount }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Solo cierra si el clic cayó en el fondo, no en el relleno del diálogo.
  function onBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary filters-toggle"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="od-icon" aria-hidden /> Filtros
        {activeCount > 0 && <span className="filters-count">{activeCount}</span>}
      </button>
      <dialog
        ref={ref}
        className="modal sheet"
        onClose={() => setOpen(false)}
        onClick={onBackdropClick}
        aria-label="Filtros"
      >
        {open && (
          <>
            <div className="sheet-head">
              <h2>Filtros</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Cerrar filtros"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="sheet-body">
              <FiltersBar
                basePath={basePath}
                filters={filters}
                facets={facets}
                onApplied={() => setOpen(false)}
              />
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
