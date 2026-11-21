import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, Search } from "lucide-react";
import JsonLd from "@/portal/components/JsonLd";
import PropertyGrid from "@/portal/components/PropertyGrid";
import VisitBeacon from "@/portal/components/VisitBeacon";
import InterestForm from "@/portal/components/InterestForm";
import PriceTag from "@/portal/components/PriceTag";
import { getProfile, getProperties, loadProfile } from "@/portal/lib/api";
import {
  formatPhoneDisplay,
  samePhoneDigits,
  telHref,
  thumbProps,
  truncate,
  whatsappHref,
} from "@/portal/lib/format";
import { portalPath, portalUrl, propertyPath } from "@/portal/lib/urls";
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
  "h-12 w-full rounded-lg border border-[var(--portal-control-border)] bg-white px-3 text-base text-[var(--portal-text)] sm:text-sm";

export default async function PortalHomePage({ params }: Props) {
  const { tenant } = await params;
  const profile = await getProfile(tenant, (slug) => portalUrl(slug));
  const slug = profile.slug;
  const { items: latest, meta } = await getProperties(
    slug,
    { orden: "recientes" },
    (s) => portalUrl(s),
    6
  );
  const featured = profile.featured;
  const featuredCodes = new Set(featured.map((p) => p.code));
  const recent = latest.filter((p) => !featuredCodes.has(p.code));
  const highlight = featured[0] ?? recent[0] ?? null;
  const highlightIsFeatured = featured.length > 0;
  const sameChannel = samePhoneDigits(profile.contact.whatsapp, profile.contact.phone);
  const wa = profile.contact.whatsapp
    ? whatsappHref(profile.contact.whatsapp, `Hola ${profile.name}, quiero más información.`)
    : null;
  const tel = telHref(profile.contact.phone);
  const waLabel = formatPhoneDisplay(profile.contact.whatsapp) ?? profile.contact.whatsapp;
  const telLabel = formatPhoneDisplay(profile.contact.phone) ?? profile.contact.phone;

  return (
    <>
      <VisitBeacon page="home" />
      <JsonLd data={agentJsonLd(profile, portalUrl(slug))} />

      <section className="bg-portal text-on-portal relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 80% 60%, #fff 0.5px, transparent 0.5px)",
            backgroundSize: "48px 48px, 64px 64px",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-[640px]">
              <p className="text-on-portal/80 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.06em] uppercase">
                <span className="h-2 w-2 rounded-full bg-[var(--portal-accent)] ring-4 ring-[var(--portal-accent)]/20" />
                Arriendo y venta
              </p>
              <h1 className="mt-4 text-[clamp(2.25rem,5.4vw,3.75rem)] leading-[1.05] font-bold tracking-[-0.035em]">
                {profile.tagline || `Encuentra tu próximo hogar con ${profile.name}`}
              </h1>
              <p className="text-on-portal/85 mt-4 max-w-[52ch] text-base leading-relaxed sm:text-lg">
                Explora el inventario de {profile.name} y encuentra el inmueble que buscas.
              </p>
            </div>

            {highlight && (
              <Link
                href={propertyPath(highlight.code, highlight.slug)}
                className="group hidden max-w-[400px] justify-self-end overflow-hidden rounded-2xl bg-white text-[var(--portal-text)] shadow-[0_24px_60px_rgba(2,28,26,.35)] transition-transform hover:-translate-y-1 lg:block"
              >
                {thumbProps(highlight.primary_image) && (
                  <div className="relative aspect-[16/10] w-full bg-[var(--portal-section)]">
                    <Image
                      {...thumbProps(highlight.primary_image)!}
                      alt={highlight.title}
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                    <span className="bg-portal text-on-portal absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold">
                      {highlight.purpose.name}
                    </span>
                  </div>
                )}
                <div className="grid gap-1 p-5">
                  <span className="text-xs font-semibold text-[var(--portal-muted)]">
                    {highlightIsFeatured ? "Destacada" : "Última publicación"}
                  </span>
                  <span className="line-clamp-2 font-semibold">{highlight.title}</span>
                  <span className="text-sm text-[var(--portal-muted)]">
                    {highlight.location.area || highlight.location.city}
                  </span>
                  <div className="mt-2">
                    <PriceTag
                      purpose={highlight.purpose.slug}
                      price={highlight.price}
                      rentPrice={highlight.rent_price}
                      currency={highlight.currency}
                      adminFee={highlight.admin_fee}
                      adminIncluded={highlight.admin_included}
                    />
                  </div>
                </div>
              </Link>
            )}
          </div>

          <form
            action={portalPath("/propiedades")}
            method="get"
            className="mt-10 grid gap-3 rounded-2xl bg-white p-4 text-[var(--portal-text)] shadow-[0_20px_48px_rgba(2,28,26,.22)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
            aria-label="Buscar propiedades"
          >
            <div>
              <label
                htmlFor="q-operacion"
                className="mb-1.5 block text-xs font-semibold text-[var(--portal-text)]"
              >
                Operación
              </label>
              <select id="q-operacion" name="operacion" className={select} defaultValue="">
                <option value="">Arriendo y venta</option>
                <option value="arriendo">Arriendo</option>
                <option value="venta">Venta</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="q-tipo"
                className="mb-1.5 block text-xs font-semibold text-[var(--portal-text)]"
              >
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
              <label
                htmlFor="q-ciudad"
                className="mb-1.5 block text-xs font-semibold text-[var(--portal-text)]"
              >
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
                className="bg-portal text-on-portal inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-6 font-semibold"
              >
                <Search className="h-4 w-4" aria-hidden /> Buscar
              </button>
            </div>
          </form>

          <p className="text-on-portal/80 mt-4 text-sm">
            <strong className="text-on-portal font-semibold">{meta.total}</strong>{" "}
            {meta.total === 1 ? "inmueble publicado" : "inmuebles publicados"} ·{" "}
            <Link href={portalPath("/propiedades")} className="underline underline-offset-4">
              Ver todo el inventario
            </Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-16 px-4 py-14 sm:px-6">
        {featured.length > 0 && (
          <section aria-labelledby="destacadas">
            <h2
              id="destacadas"
              className="text-2xl font-bold tracking-tight text-[var(--portal-text)]"
            >
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
              <h2
                id="recientes"
                className="text-2xl font-bold tracking-tight text-[var(--portal-text)]"
              >
                Últimas publicadas
              </h2>
              <Link
                href={portalPath("/propiedades")}
                className="text-sm font-semibold text-[var(--portal-text)] underline underline-offset-4"
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
          <p className="rounded-2xl border border-[var(--portal-border)] bg-white p-8 text-center text-[var(--portal-muted)]">
            Pronto publicaremos nuevas propiedades.
          </p>
        )}

        {profile.about && (
          <section aria-labelledby="nosotros" className="max-w-3xl">
            <h2
              id="nosotros"
              className="text-2xl font-bold tracking-tight text-[var(--portal-text)]"
            >
              Sobre nosotros
            </h2>
            <p className="mt-4 whitespace-pre-line text-[var(--portal-muted)]">{profile.about}</p>
          </section>
        )}

        <section
          id="contacto-home"
          aria-labelledby="contacto-home-title"
          className="rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-section)] p-6 sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2
                id="contacto-home-title"
                className="text-2xl font-bold tracking-tight text-[var(--portal-text)]"
              >
                ¿No encuentras lo que buscas?
              </h2>
              <p className="mt-2 text-[var(--portal-muted)]">
                Cuéntanos qué necesitas y te ayudamos a encontrarlo. Respondemos por el medio que
                prefieras.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {wa && profile.contact.whatsapp && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-[var(--portal-border)] bg-white px-3 py-2 font-semibold text-[var(--portal-text)]"
                  >
                    <span className="text-portal bg-portal/10 grid h-11 w-11 place-items-center rounded-lg">
                      <MessageCircle className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="grid">
                      <span className="text-xs text-[var(--portal-muted)]">WhatsApp</span>
                      <span>{waLabel}</span>
                    </span>
                  </a>
                )}
                {!sameChannel &&
                  profile.contact.phone &&
                  (tel ? (
                    <a
                      href={tel}
                      className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-[var(--portal-border)] bg-white px-3 py-2 font-semibold text-[var(--portal-text)]"
                    >
                      <span className="text-portal bg-portal/10 grid h-11 w-11 place-items-center rounded-lg">
                        <Phone className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="grid">
                        <span className="text-xs text-[var(--portal-muted)]">Teléfono</span>
                        <span>{telLabel}</span>
                      </span>
                    </a>
                  ) : (
                    <div className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-[var(--portal-border)] bg-white px-3 py-2 font-semibold text-[var(--portal-text)]">
                      <span className="text-portal bg-portal/10 grid h-11 w-11 place-items-center rounded-lg">
                        <Phone className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="grid">
                        <span className="text-xs text-[var(--portal-muted)]">Teléfono</span>
                        <span>{telLabel}</span>
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <InterestForm
              tenant={slug}
              responsibleName={profile.privacy.responsible_name || profile.name}
              context="general"
            />
          </div>
        </section>
      </div>
    </>
  );
}
