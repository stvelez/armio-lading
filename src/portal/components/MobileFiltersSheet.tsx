"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { PortalFilters, PortalProfile } from "../types";
import FiltersBar from "./FiltersBar";

interface Props {
  basePath: string;
  filters: PortalFilters;
  facets: PortalProfile["facets"];
  activeCount: number;
}

/** Hoja de filtros para móvil, con `<dialog>` nativo (foco atrapado y Esc para cerrar). */
export default function MobileFiltersSheet({ basePath, filters, facets, activeCount }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-900"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtros
        {activeCount > 0 && (
          <span className="bg-portal text-on-portal rounded-full px-2 text-xs">{activeCount}</span>
        )}
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label="Filtros"
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-white p-0 backdrop:bg-black/50"
      >
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-stone-900">Filtros</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar filtros"
                className="rounded-lg p-2 hover:bg-stone-100"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FiltersBar
                basePath={basePath}
                filters={filters}
                facets={facets}
                onApplied={() => setOpen(false)}
              />
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
