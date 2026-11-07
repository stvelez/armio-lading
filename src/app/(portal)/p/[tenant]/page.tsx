import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import JsonLd from "@/portal/components/JsonLd";
import PropertyGrid from "@/portal/components/PropertyGrid";
import VisitBeacon from "@/portal/components/VisitBeacon";
import { getProfile, getProperties, loadProfile } from "@/portal/lib/api";
import { truncate } from "@/portal/lib/format";
import { portalPath, portalUrl } from "@/portal/lib/urls";
import { agentJsonLd, buildMetadata } from "@/portal/lib/seo";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params;
  const result = await loadProfile(tenant);
  if (result.kind !== "ok") return { robots: { index: false, follow: false } };
  const profile = result.data;
  const description =
    profile.seo_description ||
    (profile.about ? truncate(profile.about, 155) : null) ||
    `Propiedades en arriendo y venta de ${profile.name}.`;
  return buildMetadata({
    title: `${profile.name}${profile.tagline ? ` – ${profile.tagline}` : " – Propiedades en arriendo y venta"}`,
    description,
    url: portalUrl(profile.slug),
    image: profile.logo_url,
    siteName: profile.name,
  });
}

const select =
  "h-12 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900";

export default async function PortalHomePage({ params }: Props) {
  const { tenant } = await params;
  const profile = await getProfile(tenant, (slug) => portalUrl(slug));
  const slug = profile.slug;
  const { items: latest } = await getProperties(
    slug,
    { orden: "recientes" },
    (s) => portalUrl(s),
    6
  );
  const featured = profile.featured;
  const featuredCodes = new Set(featured.map((p) => p.code));
  const recent = latest.filter((p) => !featuredCodes.has(p.code));

  return (
    <>
      <VisitBeacon page="home" />
      <JsonLd data={agentJsonLd(profile, portalUrl(slug))} />

      <section className="bg-portal text-on-portal">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="max-w-3xl text-3xl leading-tight font-bold sm:text-4xl">
            {profile.tagline || `Encuentra tu próximo hogar con ${profile.name}`}
          </h1>
          <p className="mt-2 text-lg opacity-90">Propiedades en arriendo y venta</p>

          <form
            action={portalPath("/propiedades")}
            method="get"
            className="mt-8 grid gap-3 rounded-xl bg-white p-4 text-stone-900 shadow-lg sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
            aria-label="Buscar propiedades"
          >
            <div>
              <label htmlFor="q-operacion" className="mb-1 block text-sm font-medium">
                Operación
              </label>
              <select id="q-operacion" name="operacion" className={select} defaultValue="">
                <option value="">Arriendo y venta</option>
                <option value="arriendo">Arriendo</option>
                <option value="venta">Venta</option>
              </select>
            </div>
            <div>
              <label htmlFor="q-tipo" className="mb-1 block text-sm font-medium">
                Tipo de inmueble
              </label>
              <select id="q-tipo" name="tipo" className={select} defaultValue="">
                <option value="">Todos</option>
                {profile.facets.types.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="q-ciudad" className="mb-1 block text-sm font-medium">
                Ciudad
              </label>
              <select id="q-ciudad" name="ciudad" className={select} defaultValue="">
                <option value="">Todas</option>
                {profile.facets.cities.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-6 font-semibold text-white lg:w-auto"
              >
                <Search className="h-4 w-4" aria-hidden /> Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6">
        {featured.length > 0 && (
          <section aria-labelledby="destacadas">
            <h2 id="destacadas" className="text-2xl font-bold text-stone-900">
              Propiedades destacadas
            </h2>
            <div className="mt-6">
              <PropertyGrid properties={featured} priorityCount={3} />
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section aria-labelledby="recientes">
            <div className="flex items-end justify-between gap-4">
              <h2 id="recientes" className="text-2xl font-bold text-stone-900">
                Últimas publicadas
              </h2>
              <Link
                href={portalPath("/propiedades")}
                className="text-sm font-semibold text-stone-800 underline underline-offset-4"
              >
                Ver todas
              </Link>
            </div>
            <div className="mt-6">
              <PropertyGrid properties={recent} priorityCount={featured.length > 0 ? 0 : 3} />
            </div>
          </section>
        )}

        {featured.length === 0 && recent.length === 0 && (
          <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-700">
            Pronto publicaremos nuevas propiedades.
          </p>
        )}

        {profile.about && (
          <section aria-labelledby="nosotros" className="max-w-3xl">
            <h2 id="nosotros" className="text-2xl font-bold text-stone-900">
              Sobre nosotros
            </h2>
            <p className="mt-4 whitespace-pre-line text-stone-800">{profile.about}</p>
          </section>
        )}

        <section
          aria-labelledby="contacto-home"
          className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8"
        >
          <h2 id="contacto-home" className="text-2xl font-bold text-stone-900">
            ¿Hablamos?
          </h2>
          <p className="mt-2 text-stone-700">
            Cuéntanos qué buscas y te ayudamos a encontrarlo. Encuentra nuestros datos de contacto
            al final de la página.
          </p>
          <a
            href="#contacto"
            className="bg-portal text-on-portal mt-4 inline-flex h-11 items-center rounded-lg px-5 font-semibold"
          >
            Ver contacto
          </a>
        </section>
      </div>
    </>
  );
}
