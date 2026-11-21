import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ImageOff } from "lucide-react";
import type { PortalPropertyCard } from "../types";
import { formatNumber, propertyHeading, thumbProps } from "../lib/format";
import { propertyPath } from "../lib/urls";
import Icon from "./Icon";
import PriceTag from "./PriceTag";

interface Props {
  property: PortalPropertyCard;
  priority?: boolean;
  operacion?: "arriendo" | "venta";
  /** Posición en la grilla: escalona la entrada (`--i`, de 0 a 2 como en el prototipo). */
  index?: number;
}

/** Tarjeta del prototipo (`cardHTML`): mismas clases y mismo orden. */
export default function PropertyCard({ property, priority = false, operacion, index = 0 }: Props) {
  const href = propertyPath(property.code, property.slug);
  const image = thumbProps(property.primary_image);
  const heading = propertyHeading(property);
  const place = property.location.city || property.location.area;

  const stats = [
    property.bedrooms !== null && `${property.bedrooms} hab.`,
    property.bathrooms !== null && `${property.bathrooms} baños`,
    property.parking_spaces ? `${property.parking_spaces} parq.` : false,
    property.area_m2 ? `${formatNumber(property.area_m2)} m²` : false,
  ].filter(Boolean) as string[];

  return (
    <article className="card reveal" style={{ "--i": index % 3 } as CSSProperties}>
      <div className="card-media">
        {image ? (
          <Image
            {...image}
            className="od-media od-media-cover"
            style={{ "--od-ratio": "4/3" } as CSSProperties}
            width={640}
            height={480}
            alt={property.title}
            sizes="(min-width: 1025px) 380px, (min-width: 641px) 50vw, 100vw"
            priority={priority}
          />
        ) : (
          <div className="noimg">
            <ImageOff className="od-icon" aria-hidden />
            <span className="sr-only">Sin fotos</span>
          </div>
        )}
        {property.badge === "reservada" && <span className="badge">Reservada</span>}
      </div>
      <div className="card-body">
        <h3 className="card-title">
          <Link href={href} className="card-link">
            {heading}
          </Link>
        </h3>
        {place && (
          <p className="loc">
            <Icon name="pin" />
            <span className="od-truncate">{place}</span>
          </p>
        )}
        <PriceTag
          purpose={property.purpose.slug}
          price={property.price}
          rentPrice={property.rent_price}
          operacion={operacion}
          currency={property.currency}
          adminFee={property.admin_fee}
          adminIncluded={property.admin_included}
        />
        {stats.length > 0 && (
          <ul className="feats" aria-label="Características">
            {stats.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
