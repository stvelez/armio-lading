import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/portal/components/Breadcrumbs";
import FilterChips from "@/portal/components/FilterChips";
import FiltersBar from "@/portal/components/FiltersBar";
import MobileFiltersSheet from "@/portal/components/MobileFiltersSheet";
import Pagination from "@/portal/components/Pagination";
import PropertyGrid from "@/portal/components/PropertyGrid";
import SortSelect from "@/portal/components/SortSelect";
import VisitBeacon from "@/portal/components/VisitBeacon";
import { getProfile, getProperties, loadProfile } from "@/portal/lib/api";
import { hasAnyFilter, hasNonCanonicalFilters, parseFilters, toQuery } from "@/portal/lib/filters";
import { portalPath, portalUrl } from "@/portal/lib/urls";
import { buildMetadata } from "@/portal/lib/seo";
import type { PortalFilters } from "@/portal/types";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function heading(filters: PortalFilters): string {
  if (filters.operacion === "arriendo") return "Propiedades en arriendo";
  if (filters.operacion === "venta") return "Propiedades en venta";
  return "Propiedades en arriendo y venta";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { tenant } = await params;
  const filters = parseFilters(await searchParams);
  const result = await loadProfile(tenant);
  if (result.kind !== "ok") return { robots: { index: false, follow: false } };
  const profile = result.data;

  // Canónica: solo operación y página
  const canonicalQuery = toQuery({ operacion: filters.operacion, page: filters.page });
  const title = `${heading(filters)} | ${profile.name}${filters.page ? ` – Página ${filters.page}` : ""}`;
  return buildMetadata({
    title,
    description: `Explora las propiedades disponibles de ${profile.name}: apartamentos, casas y más en arriendo y venta.`,
    url: portalUrl(profile.slug, `/propiedades${canonicalQuery}`),
    image: profile.logo_url,
    siteName: profile.name,
    noindex: hasNonCanonicalFilters(filters),
  });
}

export default async function ListingPage({ params, searchParams }: Props) {
  const { tenant } = await params;
  const filters = parseFilters(await searchParams);
  const rebuild = (slug: string) => portalUrl(slug, `/propiedades${toQuery(filters)}`);

  const profile = await getProfile(tenant, rebuild);
  const slug = profile.slug;
  const { items, meta } = await getProperties(slug, filters, rebuild);
  const base = portalPath("/propiedades");
  const activeCount = Object.keys(filters).filter((k) => k !== "page").length;

  return (
    <section className="section is-tight" aria-labelledby="list-title">
      <VisitBeacon page="listing" />
      <div className="container">
        <Breadcrumbs items={[{ label: "Inicio", href: portalPath() }, { label: "Propiedades" }]} />
        <div className="section-head list-head page-head">
          <div>
            <h1 className="section-title" id="list-title">
              {heading(filters)}
            </h1>
            <p className="section-sub" aria-live="polite">
              {meta.total === 0
                ? "Sin resultados"
                : `${meta.total} ${meta.total === 1 ? "inmueble publicado" : "inmuebles publicados"}`}
            </p>
          </div>
          <div className="head-actions">
            <MobileFiltersSheet
              basePath={base}
              filters={filters}
              facets={profile.facets}
              activeCount={activeCount}
            />
            <SortSelect basePath={base} filters={filters} />
          </div>
        </div>

        <div className="list-layout">
          <aside className="filters-aside" aria-label="Filtros">
            <div className="filters-panel">
              <FiltersBar basePath={base} filters={filters} facets={profile.facets} />
            </div>
          </aside>

          <div>
            <FilterChips basePath={base} filters={filters} facets={profile.facets} />
            {items.length === 0 ? (
              <div className="empty">
                <h3>No encontramos propiedades con esos filtros</h3>
                <p>
                  {hasAnyFilter(filters)
                    ? "Prueba quitando algún filtro o ampliando el rango de precio."
                    : "Por ahora no hay propiedades publicadas. Vuelve pronto."}
                </p>
                {hasAnyFilter(filters) && (
                  <div className="actions">
                    <Link href={base} className="btn btn-primary">
                      Ver todas las propiedades
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <PropertyGrid properties={items} priorityCount={2} operacion={filters.operacion} />
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  hrefFor={(p) => `${base}${toQuery({ ...filters, page: p > 1 ? p : undefined })}`}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
