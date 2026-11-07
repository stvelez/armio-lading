import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MapPin } from "lucide-react";
import Breadcrumbs from "@/portal/components/Breadcrumbs";
import ContactCard, { MobileContactBar } from "@/portal/components/ContactCard";
import InterestForm from "@/portal/components/InterestForm";
import JsonLd from "@/portal/components/JsonLd";
import PriceTag from "@/portal/components/PriceTag";
import PropertyFacts from "@/portal/components/PropertyFacts";
import PropertyFeatures from "@/portal/components/PropertyFeatures";
import PropertyGallery from "@/portal/components/PropertyGallery";
import PropertyMap from "@/portal/components/PropertyMap";
import ShareButtons from "@/portal/components/ShareButtons";
import VisitBeacon from "@/portal/components/VisitBeacon";
import { getProfile, loadProfile, loadProperty, unwrap } from "@/portal/lib/api";
import { httpsUrl } from "@/portal/lib/format";
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
  const place = placeLabel(property.location);
  const images = property.images.filter((i) => httpsUrl(i.url));
  const { latitude, longitude } = property.location;
  const hasPin = typeof latitude === "number" && typeof longitude === "number";
  const whatsapp = property.contact.whatsapp ?? profile.contact.whatsapp;
  const phone = property.contact.phone ?? profile.contact.phone;
  const responsible = profile.privacy.responsible_name || profile.name;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:pb-10">
      <VisitBeacon page="property" code={property.code} />
      <JsonLd data={propertyJsonLd({ property, profile, url })} />
      <Breadcrumbs
        items={[
          { label: "Inicio", href: portalPath() },
          { label: "Propiedades", href: portalPath("/propiedades") },
          { label: property.title },
        ]}
      />

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-10">
          <PropertyGallery images={images} title={property.title} />

          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-portal text-on-portal rounded-full px-3 py-1 text-xs font-semibold">
                {property.purpose.name}
              </span>
              <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700">
                {property.type.name}
              </span>
              {property.badge === "reservada" && (
                <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
                  Reservada
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">{property.title}</h1>
            {(place || property.building) && (
              <p className="mt-2 flex items-start gap-1.5 text-stone-700">
                <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {[property.building, property.location.address, place]
                    .filter(Boolean)
                    .join(" · ")}
                  {property.location.department ? `, ${property.location.department}` : ""}
                </span>
              </p>
            )}
            <div className="mt-4">
              <PriceTag
                purpose={property.purpose.slug}
                price={property.price}
                currency={property.currency}
                adminFee={property.admin_fee}
                adminIncluded={property.admin_included}
                size="lg"
              />
            </div>
          </header>

          <PropertyFacts property={property} />

          {property.description && (
            <section aria-labelledby="descripcion">
              <h2 id="descripcion" className="text-xl font-semibold text-stone-900">
                Descripción
              </h2>
              {/* Texto plano: nunca HTML */}
              <p className="mt-4 whitespace-pre-line text-stone-800">{property.description}</p>
            </section>
          )}

          <PropertyFeatures items={property.characteristics} />

          {hasPin && (
            <PropertyMap
              latitude={latitude}
              longitude={longitude}
              exact={Boolean(property.location.address)}
              title={property.title}
            />
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-label="Contacto">
          <ContactCard
            agencyName={profile.name}
            title={property.title}
            url={url}
            whatsapp={whatsapp}
            phone={phone}
            agentName={property.agent?.first_name}
          />
          <InterestForm
            tenant={slug}
            responsibleName={responsible}
            propertyCode={property.code}
            propertyTitle={property.title}
          />
          <div>
            <h2 className="mb-2 text-sm font-semibold text-stone-800">Compartir</h2>
            <ShareButtons title={property.title} url={url} />
          </div>
        </aside>
      </div>

      <MobileContactBar title={property.title} url={url} whatsapp={whatsapp} phone={phone} />
    </div>
  );
}
