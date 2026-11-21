import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "@/portal/components/Breadcrumbs";
import ContactCard, { MobileContactBar } from "@/portal/components/ContactCard";
import Icon from "@/portal/components/Icon";
import InterestForm from "@/portal/components/InterestForm";
import JsonLd from "@/portal/components/JsonLd";
import PriceTag from "@/portal/components/PriceTag";
import PropertyFacts, { PropertyStats } from "@/portal/components/PropertyFacts";
import PropertyFeatures from "@/portal/components/PropertyFeatures";
import PropertyGallery from "@/portal/components/PropertyGallery";
import PropertyMap from "@/portal/components/PropertyMap";
import ShareButtons from "@/portal/components/ShareButtons";
import VisitBeacon from "@/portal/components/VisitBeacon";
import { getProfile, loadProfile, loadProperty, unwrap } from "@/portal/lib/api";
import { httpsUrl, propertyHeading } from "@/portal/lib/format";
import { portalPath, portalUrl, propertyPath } from "@/portal/lib/urls";
import {
  buildMetadata,
  placeLabel,
  propertyDescription,
  propertyJsonLd,
  propertyTitle,
} from "@/portal/lib/seo";

type Props = { params: Promise<{ tenant: string; property: string }> };

function parseCode(raw: string): number | null {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* se usa tal cual */
  }
  const match = /^(\d+)/.exec(decoded);
  if (!match || match[1].length > 9) return null;
  const code = Number(match[1]);
  return code > 0 ? code : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, property: raw } = await params;
  const code = parseCode(raw);
  if (code === null) return { robots: { index: false, follow: false } };
  const [profileRes, propRes] = await Promise.all([
    loadProfile(tenant),
    loadProperty(tenant, code),
  ]);
  if (profileRes.kind !== "ok" || propRes.kind !== "ok") {
    return { robots: { index: false, follow: false } };
  }
  const profile = profileRes.data;
  const property = propRes.data;
  return buildMetadata({
    title: propertyTitle(property, profile),
    description: propertyDescription(property, profile),
    url: portalUrl(profile.slug, propertyPath(property.code, property.slug)),
    image: property.images[0]?.url ?? property.primary_image?.url,
    siteName: profile.name,
  });
}

export default async function PropertyPage({ params }: Props) {
  const { tenant, property: raw } = await params;
  const code = parseCode(raw);
  if (code === null) notFound();

  const rebuild = (slug: string) => portalUrl(slug, `/propiedades/${raw}`);
  const profile = await getProfile(tenant, rebuild);
  const slug = profile.slug;
  const property = unwrap(await loadProperty(tenant, code), rebuild);

  // URL canónica `{code}-{slug-del-titulo}`
  const canonical = `${property.code}-${property.slug}`;
  let current = raw;
  try {
    current = decodeURIComponent(raw);
  } catch {
    /* se compara tal cual */
  }
  if (current !== canonical) permanentRedirect(propertyPath(property.code, property.slug));

  const url = portalUrl(slug, propertyPath(property.code, property.slug));
  const heading = propertyHeading(property);
  const place = placeLabel(property.location);
  const images = property.images.filter((i) => httpsUrl(i.url));
  const { latitude, longitude } = property.location;
  const hasPin = typeof latitude === "number" && typeof longitude === "number";
  const whatsapp = property.contact.whatsapp ?? profile.contact.whatsapp;
  const phone = property.contact.phone ?? profile.contact.phone;
  const responsible = profile.privacy.responsible_name || profile.name;

  return (
    <section className="section is-tight detail-page" aria-labelledby="detail-title">
      <VisitBeacon page="property" code={property.code} />
      <JsonLd data={propertyJsonLd({ property, profile, url })} />
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: portalPath() },
            { label: "Propiedades", href: portalPath("/propiedades") },
            { label: heading },
          ]}
        />

        {/* `.detail` del prototipo, como página en vez de diálogo */}
        <div className="detail detail-shell">
          <div className="detail-media">
            <PropertyGallery images={images} title={heading} />
            <span className="badge">{property.purpose.name}</span>
            {property.badge === "reservada" && <span className="badge">Reservada</span>}
          </div>
          <div className="detail-body">
            <h1 className="detail-title" id="detail-title">
              {heading}
            </h1>
            {(place || property.building) && (
              <p className="loc">
                <Icon name="pin" />
                <span>
                  {[property.building, property.location.address, place]
                    .filter(Boolean)
                    .join(" · ")}
                  {property.location.department ? `, ${property.location.department}` : ""}
                </span>
              </p>
            )}
            <div className="detail-prices">
              <PriceTag
                purpose={property.purpose.slug}
                price={property.price}
                rentPrice={property.rent_price}
                currency={property.currency}
                adminFee={property.admin_fee}
                adminIncluded={property.admin_included}
                size="lg"
              />
            </div>
            <PropertyStats property={property} />
            <ContactCard
              agencyName={profile.name}
              title={heading}
              url={url}
              whatsapp={whatsapp}
              phone={phone}
              agentName={property.agent?.first_name}
            />
          </div>
        </div>

        <div className="detail-more">
          <div className="detail-main">
            {property.description && (
              <section className="detail-section" aria-labelledby="descripcion">
                <h2 id="descripcion">Descripción</h2>
                {/* Texto plano: nunca HTML */}
                <p className="text">{property.description}</p>
              </section>
            )}

            <PropertyFacts property={property} />

            <PropertyFeatures items={property.characteristics} />

            {hasPin && (
              <PropertyMap
                latitude={latitude}
                longitude={longitude}
                exact={Boolean(property.location.address)}
                title={heading}
              />
            )}
          </div>

          <aside className="detail-side" aria-label="Contacto">
            <InterestForm
              tenant={slug}
              responsibleName={responsible}
              propertyCode={property.code}
              propertyTitle={heading}
            />
            <div className="share">
              <h2>Compartir</h2>
              <ShareButtons title={heading} url={url} />
            </div>
          </aside>
        </div>
      </div>

      <MobileContactBar title={heading} url={url} whatsapp={whatsapp} phone={phone} />
    </section>
  );
}

/**
 * Sin parámetros en build: cada portal se genera en la primera visita y queda en ISR.
 * Sin esto, Next 16 renderiza `/p/[tenant]` por petición y el HTML no se cachea en el CDN.
 */
export async function generateStaticParams() {
  return [];
}
