import {
  Bath,
  BedDouble,
  Building,
  Calendar,
  Car,
  Layers,
  Maximize2,
  Ruler,
  Sofa,
} from "lucide-react";
import type { PortalPropertyDetail } from "../types";
import { formatNumber } from "../lib/format";

const CONDITIONS: Record<string, string> = {
  new: "Nuevo",
  good: "Buen estado",
  excellent: "Excelente",
  to_renovate: "Por remodelar",
  under_construction: "En construcción",
  remodeled: "Remodelado",
};

interface Fact {
  icon: typeof Bath;
  label: string;
  value: string;
}

export default function PropertyFacts({ property: p }: { property: PortalPropertyDetail }) {
  const baths =
    p.bathrooms !== null
      ? `${p.bathrooms}${p.half_bathrooms ? ` + ${p.half_bathrooms} medio${p.half_bathrooms > 1 ? "s" : ""}` : ""}`
      : null;
  const facts = [
    p.bedrooms !== null && { icon: BedDouble, label: "Habitaciones", value: String(p.bedrooms) },
    baths && { icon: Bath, label: "Baños", value: baths },
    p.parking_spaces
      ? { icon: Car, label: "Parqueaderos", value: String(p.parking_spaces) }
      : false,
    p.area_m2 ? { icon: Maximize2, label: "Área", value: `${formatNumber(p.area_m2)} m²` } : false,
    p.private_area_m2 && p.private_area_m2 !== p.area_m2
      ? { icon: Ruler, label: "Área privada", value: `${formatNumber(p.private_area_m2)} m²` }
      : false,
    p.total_area_m2 && p.total_area_m2 !== p.area_m2
      ? { icon: Ruler, label: "Área total", value: `${formatNumber(p.total_area_m2)} m²` }
      : false,
    p.stratum ? { icon: Layers, label: "Estrato", value: String(p.stratum) } : false,
    p.floor !== null ? { icon: Building, label: "Piso", value: String(p.floor) } : false,
    p.storage_rooms
      ? { icon: Building, label: "Depósitos", value: String(p.storage_rooms) }
      : false,
    p.built_year
      ? { icon: Calendar, label: "Año de construcción", value: String(p.built_year) }
      : false,
    p.condition
      ? {
          icon: Building,
          label: "Estado",
          value: CONDITIONS[p.condition] ?? p.condition.replace(/_/g, " "),
        }
      : false,
    p.furnished !== null
      ? { icon: Sofa, label: "Amoblado", value: p.furnished ? "Sí" : "No" }
      : false,
    p.pet_friendly !== null
      ? { icon: Layers, label: "Mascotas", value: p.pet_friendly ? "Permitidas" : "No permitidas" }
      : false,
  ].filter(Boolean) as Fact[];

  if (facts.length === 0) return null;

  return (
    <section aria-labelledby="facts-title">
      <h2 id="facts-title" className="text-xl font-semibold text-stone-900">
        Detalles
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {facts.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs text-stone-600">{label}</dt>
              <dd className="font-semibold text-stone-900">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      {p.available_from && (
        <p className="mt-3 text-sm text-stone-600">
          Disponible desde el{" "}
          {new Intl.DateTimeFormat("es-CO", {
            dateStyle: "long",
            timeZone: "America/Bogota",
          }).format(new Date(p.available_from))}
          .
        </p>
      )}
    </section>
  );
}
