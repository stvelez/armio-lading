import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  /** Arma el href de una página (conserva los filtros). */
  hrefFor: (page: number) => string;
}

function windowPages(page: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  const base =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium";
  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className={`${base} border-stone-300 bg-white hover:bg-stone-50`}
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Anterior
        </Link>
      ) : null}
      {windowPages(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-stone-500" aria-hidden>
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className={`${base} border-portal bg-portal text-on-portal`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-label={`Página ${p}`}
            className={`${base} border-stone-300 bg-white hover:bg-stone-50`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className={`${base} border-stone-300 bg-white hover:bg-stone-50`}
        >
          Siguiente <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
