import type { PortalPropertyCard } from "../types";
import PropertyCard from "./PropertyCard";

export default function PropertyGrid({
  tenant,
  properties,
  priorityCount = 0,
}: {
  tenant: string;
  properties: PortalPropertyCard[];
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, i) => (
        <li key={property.code} className="flex">
          <div className="flex w-full">
            <PropertyCard tenant={tenant} property={property} priority={i < priorityCount} />
          </div>
        </li>
      ))}
    </ul>
  );
}
