import type { PortalPropertyCard } from "../types";
import PropertyCard from "./PropertyCard";

/** `.grid` del prototipo. Cada tarjeta es un `<article class="card">` directo, como en `render()`. */
export default function PropertyGrid({
  properties,
  // La primera tarjeta suele ser el LCP: se precarga para no esperar al scroll.
  priorityCount = 1,
  operacion,
}: {
  properties: PortalPropertyCard[];
  priorityCount?: number;
  operacion?: "arriendo" | "venta";
}) {
  return (
    <div className="grid">
      {properties.map((property, i) => (
        <PropertyCard
          key={property.code}
          property={property}
          priority={i < priorityCount}
          operacion={operacion}
          index={i}
        />
      ))}
    </div>
  );
}
