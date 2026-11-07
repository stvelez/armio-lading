import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/portal/components/Breadcrumbs";
import FiltersBar from "@/portal/components/FiltersBar";
import MobileFiltersSheet from "@/portal/components/MobileFiltersSheet";
import Pagination from "@/portal/components/Pagination";
import PropertyGrid from "@/portal/components/PropertyGrid";
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <VisitBeacon page="listing" />
      <Breadcrumbs items={[{ label: "Inicio", href: portalPath() }, { label: "Propiedades" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{heading(filters)}</h1>
          <p className="mt-1 text-sm text-stone-600" aria-live="polite">
            {meta.total === 0
              ? "Sin resultados"
              : `${meta.total} ${meta.total === 1 ? "propiedad" : "propiedades"}`}
          </p>
        </div>
        <MobileFiltersSheet
          basePath={base}
          filters={filters}
          facets={profile.facets}
          activeCount={activeCount}
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-5">
            <FiltersBar basePath={base} filters={filters} facets={profile.facets} />
          </div>
        </aside>

        <div>
          {items.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-stone-900">
                No encontramos propiedades con esos filtros
              </h2>
              <p className="mt-2 text-stone-700">
                {hasAnyFilter(filters)
                  ? "Prueba quitando algún filtro o ampliando el rango de precio."
                  : "Por ahora no hay propiedades publicadas. Vuelve pronto."}
              </p>
              {hasAnyFilter(filters) && (
                <Link
                  href={base}
                  className="bg-portal text-on-portal mt-5 inline-flex h-11 items-center rounded-lg px-5 font-semibold"
                >
                  Ver todas las propiedades
                </Link>
              )}
            </div>
          ) : (
            <>
              <PropertyGrid properties={items} priorityCount={2} />
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
  );
}
