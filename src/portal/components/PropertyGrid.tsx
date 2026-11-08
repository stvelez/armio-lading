import type { PortalPropertyCard } from "../types";
import PropertyCard from "./PropertyCard";

export default function PropertyGrid({
  properties,
  priorityCount = 0,
  operacion,
}: {
  properties: PortalPropertyCard[];
  priorityCount?: number;
  operacion?: "arriendo" | "venta";
}) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, i) => (
        <li key={property.code} className="flex">
          <div className="flex w-full">
            <PropertyCard property={property} priority={i < priorityCount} operacion={operacion} />
          </div>
        </li>
      ))}
    </ul>
  );
}
