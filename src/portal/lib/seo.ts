import type { Metadata } from "next";
import type { PortalProfile, PortalPropertyDetail } from "../types";
import { httpsUrl, operationLabel, truncate } from "./format";
import { portalUrl } from "./urls";

export function placeLabel(loc: { area: string | null; city: string | null }): string {
  return loc.area || loc.city || "";
}

export function propertyTitle(property: PortalPropertyDetail, profile: PortalProfile): string {
  const place = placeLabel(property.location);
  const op = operationLabel(property.purpose.slug);
  return `${property.title} en ${op}${place ? ` – ${place}` : ""} | ${profile.name}`;
}

export function propertyDescription(property: PortalPropertyDetail, profile: PortalProfile) {
  if (property.description) return truncate(property.description, 155);
  const place = placeLabel(property.location);
  return truncate(
    `${property.type.name} en ${operationLabel(property.purpose.slug)}${place ? ` en ${place}` : ""}. Consulta con ${profile.name}.`,
    155
  );
}

export function buildMetadata(opts: {
  title: string;
  description: string;
  /** URL absoluta en el subdominio del tenant (`portalUrl`). */
  url: string;
  image?: string | null;
  siteName: string;
  noindex?: boolean;
}): Metadata {
  const { url } = opts;
  const image = httpsUrl(opts.image);
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url,
      siteName: opts.siteName,
      title: opts.title,
      description: opts.description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

const ACCOMMODATION_TYPES: Record<string, string> = {
  apartamento: "Apartment",
  apartaestudio: "Apartment",
  casa: "House",
};

export function propertyJsonLd(opts: {
  property: PortalPropertyDetail;
  profile: PortalProfile;
  url: string;
}) {
  const { property, profile, url } = opts;
  const images = property.images.map((i) => httpsUrl(i.url)).filter((u): u is string => !!u);
  const area = property.private_area_m2 ?? property.area_m2 ?? property.total_area_m2;
  const geo =
    typeof property.location.latitude === "number" &&
    typeof property.location.longitude === "number"
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.location.latitude,
            longitude: property.location.longitude,
          },
        }
      : {};

  const currency = property.currency || "COP";
  const availability =
    property.badge === "reservada"
      ? "https://schema.org/LimitedAvailability"
      : "https://schema.org/InStock";
  const SELL = "http://purl.org/goodrelations/v1#Sell";
  const LEASE_OUT = "http://purl.org/goodrelations/v1#LeaseOut";
  const saleOffer = {
    "@type": "Offer",
    // Con propósito solo arriendo, `price` es el canon mensual
    businessFunction: property.purpose.slug === "rent" ? LEASE_OUT : SELL,
    price: property.price,
    priceCurrency: currency,
    availability,
  };
  const rentOffer = {
    "@type": "Offer",
    businessFunction: LEASE_OUT,
    price: property.rent_price,
    priceCurrency: currency,
    availability,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: property.rent_price,
      priceCurrency: currency,
      unitCode: "MON",
    },
  };
  // `both` con canon: dos ofertas (venta y arriendo); sin canon, la única oferta es la de `price`.
  const offers =
    property.purpose.slug === "both" && property.rent_price && property.rent_price > 0
      ? [saleOffer, rentOffer]
      : saleOffer;

  const listing = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    url,
    ...(property.published_at ? { datePosted: property.published_at } : {}),
    ...(images.length ? { image: images } : {}),
    ...(property.description ? { description: truncate(property.description, 300) } : {}),
    offers: offers,
    about: {
      "@type": ACCOMMODATION_TYPES[property.type.slug] ?? "Accommodation",
      name: property.type.name,
      ...(property.bedrooms !== null ? { numberOfRooms: property.bedrooms } : {}),
      ...(property.bathrooms !== null ? { numberOfBathroomsTotal: property.bathrooms } : {}),
      ...(area
        ? { floorSize: { "@type": "QuantitativeValue", value: area, unitCode: "MTK" } }
        : {}),
      address: {
        "@type": "PostalAddress",
        ...(property.location.city ? { addressLocality: property.location.city } : {}),
        ...(property.location.department ? { addressRegion: property.location.department } : {}),
        addressCountry: "CO",
      },
      ...geo,
    },
    provider: { "@type": "RealEstateAgent", name: profile.name },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: profile.name,
        item: portalUrl(profile.slug),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Propiedades",
        item: portalUrl(profile.slug, "/propiedades"),
      },
      { "@type": "ListItem", position: 3, name: property.title, item: url },
    ],
  };

  return [listing, breadcrumbs];
}

export function agentJsonLd(profile: PortalProfile, url: string) {
  const logo = httpsUrl(profile.logo_url);
  const sameAs = [profile.social.instagram, profile.social.facebook]
    .map((s) => httpsUrl(s))
    .filter((s): s is string => !!s);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: profile.name,
    url,
    ...(logo ? { logo } : {}),
    ...(profile.contact.phone || profile.contact.whatsapp
      ? { telephone: profile.contact.phone || profile.contact.whatsapp }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
