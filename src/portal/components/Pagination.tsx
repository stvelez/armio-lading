import Link from "next/link";

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

/** Paginación con los botones del prototipo (`.btn-secondary`; la página actual, `.btn-primary`). */
export default function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pager" aria-label="Paginación">
      {page > 1 ? (
        <Link className="btn btn-secondary" href={hrefFor(page - 1)} rel="prev">
          ← Anterior
        </Link>
      ) : null}
      {windowPages(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="pager-gap" aria-hidden>
            …
          </span>
        ) : p === page ? (
          <span key={p} className="btn btn-primary" aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} className="btn btn-secondary" href={hrefFor(p)} aria-label={`Página ${p}`}>
            {p}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link className="btn btn-secondary" href={hrefFor(page + 1)} rel="next">
          Siguiente →
        </Link>
      ) : null}
    </nav>
  );
}
