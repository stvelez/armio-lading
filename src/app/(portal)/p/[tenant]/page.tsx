import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import Icon from "@/portal/components/Icon";
import InterestForm from "@/portal/components/InterestForm";
import JsonLd from "@/portal/components/JsonLd";
import PropertyGrid from "@/portal/components/PropertyGrid";
import SortSelect from "@/portal/components/SortSelect";
import VisitBeacon from "@/portal/components/VisitBeacon";
import { getProfile, getProperties, loadProfile } from "@/portal/lib/api";
import {
  formatPhoneDisplay,
  formatPrice,
  propertyHeading,
  samePhoneDigits,
  telHref,
  thumbProps,
  truncate,
  whatsappHref,
} from "@/portal/lib/format";
import { portalPath, portalUrl, propertyPath } from "@/portal/lib/urls";
import { agentJsonLd, buildMetadata } from "@/portal/lib/seo";
import type { PortalProfile, PortalPropertyCard } from "@/portal/types";

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

const HERO_LINES = [
  "M-80 600C160 540 340 620 600 560S1060 430 1520 480",
  "M-80 530C180 470 360 550 620 490S1080 360 1520 410",
  "M-80 460C200 400 380 480 640 420S1100 290 1520 340",
  "M-80 390C220 330 400 410 660 350S1120 220 1520 270",
  "M-80 320C240 260 420 340 680 280S1140 150 1520 200",
  "M-80 250C260 190 440 270 700 210S1160 80 1520 130",
  "M-80 180C280 120 460 200 720 140S1180 10 1520 60",
  "M-80 110C300 50 480 130 740 70S1200 -60 1520 -10",
];

/** `--d` / `--i` del prototipo: retraso escalonado de las animaciones de entrada. */
const step = (name: "--d" | "--i", n: number) => ({ [name]: n }) as React.CSSProperties;

/** «Arriendo y venta en Cali y Medellín», con lo que realmente publica la inmobiliaria. */
function eyebrowOf(profile: PortalProfile): string {
  const { purposes, cities } = profile.facets;
  const rent = purposes.includes("arriendo");
  const sale = purposes.includes("venta");
  const operation = rent && !sale ? "Arriendo" : sale && !rent ? "Venta" : "Arriendo y venta";
  const names = cities.map((c) => c.name);
  const place = names.length > 0 && names.length <= 2 ? names.join(" y ") : profile.city;
  return place ? `${operation} en ${place}` : operation;
}

/** Precio de una sola línea para la destacada: el canon mensual cuando hay arriendo. */
function featurePrice(p: PortalPropertyCard): string {
  const rent =
    p.purpose.slug === "rent"
      ? p.price
      : p.purpose.slug === "both" && typeof p.rent_price === "number"
        ? p.rent_price
        : 0;
  const value = rent > 0 ? rent : p.price;
  if (!(value > 0)) return "Consultar precio";
  return `${formatPrice(value, p.currency)}${rent > 0 ? "/mes" : ""}`;
}

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
  const listed = [...featured, ...recent];
  const highlight = featured[0] ?? recent[0] ?? null;
  const highlightImage = highlight ? thumbProps(highlight.primary_image) : null;
  const sameChannel = samePhoneDigits(profile.contact.whatsapp, profile.contact.phone);
  const wa = profile.contact.whatsapp
    ? whatsappHref(
        profile.contact.whatsapp,
        `Hola ${profile.name}, vengo del portal web y quiero más información.`
      )
    : null;
  const tel = telHref(profile.contact.phone);
  const waLabel = formatPhoneDisplay(profile.contact.whatsapp) ?? profile.contact.whatsapp;
  const telLabel = formatPhoneDisplay(profile.contact.phone) ?? profile.contact.phone;
  const about = profile.about ? truncate(profile.about, 160) : null;
  const lead =
    about ??
    `Apartamentos y casas seleccionados por ${profile.name}. Cuéntanos qué buscas y te ayudamos a encontrarlo.`;
  const totalLabel = `${meta.total} ${meta.total === 1 ? "inmueble publicado" : "inmuebles publicados"}`;

  return (
    <>
      <VisitBeacon page="home" />
      <JsonLd data={agentJsonLd(profile, portalUrl(slug))} />

      {/* HERO · variante color (el API no expone imagen de portada) */}
      <section className="hero" aria-labelledby="hero-title">
        <svg
          className="hero-lines"
          viewBox="0 0 1440 640"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {HERO_LINES.map((d, i) => (
              <path key={d} pathLength={1} style={{ "--i": i } as React.CSSProperties} d={d} />
            ))}
          </g>
        </svg>

        <div className="container">
          <div className="hero-top">
            <div className="hero-copy">
              <p className="eyebrow anim" style={step("--d", 0)}>
                {eyebrowOf(profile)}
              </p>
              <h1 id="hero-title" className="anim" style={step("--d", 1)}>
                {profile.tagline || "Encuentra tu próximo hogar"}
              </h1>
              <p className="hero-lead anim" style={step("--d", 2)}>
                {lead}
              </p>
            </div>
            {highlight && (
              <Link
                className="hero-feature anim"
                style={step("--d", 3)}
                href={propertyPath(highlight.code, highlight.slug)}
                aria-label={`${featured.length > 0 ? "Destacada" : "Última publicación"}: ${propertyHeading(highlight)}${highlight.location.city ? `, ${highlight.location.city}` : ""}. Ver ficha`}
              >
                <span className="hero-feature-media" style={{ display: "block" }}>
                  {highlightImage ? (
                    <Image
                      {...highlightImage}
                      className="od-media od-media-cover"
                      style={{ "--od-ratio": "16/10" } as React.CSSProperties}
                      width={800}
                      height={500}
                      sizes="400px"
                      alt=""
                      priority
                    />
                  ) : (
                    <span className="hero-feature-noimg">
                      <ImageOff className="od-icon" aria-hidden />
                    </span>
                  )}
                  <span className="badge">{highlight.purpose.name}</span>
                </span>
                <span className="hero-feature-body">
                  <span className="hero-feature-tag">
                    {featured.length > 0 ? "Destacada" : "Última publicación"}
                  </span>
                  <span className="hero-feature-title">{propertyHeading(highlight)}</span>
                  {(highlight.location.city || highlight.location.area) && (
                    <span className="hero-feature-loc">
                      {highlight.location.city || highlight.location.area}
                    </span>
                  )}
                  <span className="hero-feature-price od-nowrap">{featurePrice(highlight)}</span>
                </span>
              </Link>
            )}
          </div>

          <form
            className="search anim"
            style={step("--d", 4)}
            id="buscar"
            role="search"
            aria-label="Buscar inmuebles"
            action={portalPath("/propiedades")}
            method="get"
          >
            <div className="seg-wrap">
              <span className="field-label" id="op-label">
                Operación
              </span>
              <fieldset className="seg" aria-labelledby="op-label">
                <label>
                  <input type="radio" name="operacion" value="" defaultChecked />
                  <span>Todas</span>
                </label>
                <label>
                  <input type="radio" name="operacion" value="arriendo" />
                  <span>Arriendo</span>
                </label>
                <label>
                  <input type="radio" name="operacion" value="venta" />
                  <span>Venta</span>
                </label>
              </fieldset>
            </div>
            <div>
              <label className="field-label" htmlFor="f-type">
                Tipo de inmueble
              </label>
              <select className="select" id="f-type" name="tipo" defaultValue="">
                <option value="">Todos</option>
                {profile.facets.types.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="f-city">
                Ciudad
              </label>
              <select className="select" id="f-city" name="ciudad" defaultValue="">
                <option value="">Todas</option>
                {profile.facets.cities.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              <Icon name="search" />
              Buscar
            </button>
          </form>
          <p className="hero-foot anim" style={step("--d", 5)}>
            <span>
              <strong>{meta.total}</strong>{" "}
              {meta.total === 1 ? "inmueble publicado" : "inmuebles publicados"}
            </span>
            <Link href={portalPath("/propiedades")}>Ver todos</Link>
          </p>
        </div>
      </section>

      {/* INMUEBLES */}
      <section className="section" id="inmuebles" aria-labelledby="list-title">
        <div className="container">
          <div className="section-head list-head">
            <div>
              <h2 className="section-title" id="list-title" tabIndex={-1}>
                Inmuebles disponibles
              </h2>
              <p className="section-sub" aria-live="polite">
                {meta.total === 0 ? "Sin resultados" : totalLabel}
              </p>
            </div>
            <SortSelect basePath={portalPath("/propiedades")} />
          </div>

          <div className="list-tools">
            <a className="btn btn-quiet" href="#buscar">
              <Icon name="search" />
              Cambiar búsqueda
            </a>
          </div>

          {listed.length > 0 ? (
            <PropertyGrid properties={listed} priorityCount={0} />
          ) : (
            <div className="empty">
              <h3>Pronto publicaremos nuevas propiedades</h3>
              <p>Cuéntanos qué buscas y te avisamos cuando tengamos algo así.</p>
              <div className="actions">
                <a className="btn btn-primary" href="#contacto">
                  Escribirnos
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {profile.about && profile.about.length > 160 && (
        <section className="section is-tight about" aria-labelledby="nosotros">
          <div className="narrow container">
            <h2 className="section-title" id="nosotros">
              Sobre nosotros
            </h2>
            <p>{profile.about}</p>
          </div>
        </section>
      )}

      {/* CONTACTO */}
      <section className="section contact" id="contacto" aria-labelledby="contact-title">
        <div className="contact-grid container">
          <div className="contact-copy reveal">
            <h2 className="section-title" id="contact-title">
              ¿No encuentras lo que buscas?
            </h2>
            <p>
              Cuéntanos qué necesitas y te ayudamos a encontrarlo. Respondemos por el medio que
              prefieras.
            </p>
            <div className="contact-list">
              {wa && profile.contact.whatsapp && (
                <a className="contact-item" href={wa} target="_blank" rel="noopener noreferrer">
                  <span className="contact-ico">
                    <Icon name="chat" />
                  </span>
                  <span className="od-stat">
                    <span>WhatsApp</span>
                    <span className="od-nowrap">{waLabel}</span>
                  </span>
                </a>
              )}
              {!sameChannel &&
                profile.contact.phone &&
                (tel ? (
                  <a className="contact-item" href={tel}>
                    <span className="contact-ico">
                      <Icon name="phone" />
                    </span>
                    <span className="od-stat">
                      <span>Teléfono</span>
                      <span className="od-nowrap">{telLabel}</span>
                    </span>
                  </a>
                ) : (
                  <div className="contact-item">
                    <span className="contact-ico">
                      <Icon name="phone" />
                    </span>
                    <span className="od-stat">
                      <span>Teléfono</span>
                      <span className="od-nowrap">{telLabel}</span>
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="reveal" style={step("--i", 1)}>
            <InterestForm
              tenant={slug}
              responsibleName={profile.privacy.responsible_name || profile.name}
              context="general"
            />
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Sin parámetros en build: cada portal se genera en la primera visita y queda en ISR.
 */
export async function generateStaticParams() {
  return [];
}
