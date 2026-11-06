import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Car, Maximize2, MapPin, ImageOff } from "lucide-react";
import type { PortalPropertyCard } from "../types";
import { formatNumber, httpsUrl, imageProps, propertyPath } from "../lib/format";
import PriceTag from "./PriceTag";

interface Props {
  tenant: string;
  property: PortalPropertyCard;
  priority?: boolean;
}

export default function PropertyCard({ tenant, property, priority = false }: Props) {
  const href = propertyPath(tenant, property.code, property.slug);
  const image = httpsUrl(property.primary_image?.url);
  const place = property.location.area || property.location.city;

  const stats = [
    property.bedrooms !== null && { icon: BedDouble, label: `${property.bedrooms} hab.` },
    property.bathrooms !== null && { icon: Bath, label: `${property.bathrooms} baños` },
    property.parking_spaces ? { icon: Car, label: `${property.parking_spaces} parq.` } : false,
    property.area_m2 ? { icon: Maximize2, label: `${formatNumber(property.area_m2)} m²` } : false,
  ].filter(Boolean) as { icon: typeof Bath; label: string }[];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-stone-100">
        {image ? (
          <Image
            {...imageProps(image)}
            alt={property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <ImageOff className="h-8 w-8" aria-hidden />
            <span className="sr-only">Sin fotos</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-portal text-on-portal rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
            {property.purpose.name}
          </span>
          {property.badge === "reservada" && (
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Reservada
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            {property.type.name}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-base font-semibold text-stone-900">
            <Link
              href={href}
              className="after:absolute after:inset-0 focus-visible:outline-offset-[-2px]"
            >
              {property.title}
            </Link>
          </h3>
          {place && (
            <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{place}</span>
            </p>
          )}
        </div>
        <PriceTag
          purpose={property.purpose.slug}
          price={property.price}
          currency={property.currency}
          adminFee={property.admin_fee}
          adminIncluded={property.admin_included}
        />
        {stats.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-stone-100 pt-3 text-sm text-stone-700">
            {stats.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-stone-500" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
