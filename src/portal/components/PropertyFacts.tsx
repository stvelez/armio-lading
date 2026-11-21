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
  label: string;
  value: string;
}

function Stat({ label, value }: Fact) {
  return (
    <div className="od-stat">
      <span>{value}</span>
      <span>{label}</span>
    </div>
  );
}

/** `.detail-feats` del prototipo: habitaciones, baños, parqueaderos y área. */
export function PropertyStats({ property: p }: { property: PortalPropertyDetail }) {
  const baths =
    p.bathrooms !== null
      ? `${p.bathrooms}${p.half_bathrooms ? ` + ${p.half_bathrooms} medio${p.half_bathrooms > 1 ? "s" : ""}` : ""}`
      : null;
  const stats = [
    p.bedrooms !== null && { label: "Habitaciones", value: String(p.bedrooms) },
    baths && { label: "Baños", value: baths },
    p.parking_spaces ? { label: "Parqueaderos", value: String(p.parking_spaces) } : false,
    p.area_m2 ? { label: "m²", value: formatNumber(p.area_m2) } : false,
  ].filter(Boolean) as Fact[];

  if (stats.length === 0) return null;
  return (
    <div className="detail-feats">
      {stats.map((s) => (
        <Stat key={s.label} {...s} />
      ))}
    </div>
  );
}

/** Resto de datos de la ficha (lo que el prototipo no muestra), con el mismo lenguaje de `.detail-feats`. */
export default function PropertyFacts({ property: p }: { property: PortalPropertyDetail }) {
  const facts = [
    p.private_area_m2 && p.private_area_m2 !== p.area_m2
      ? { label: "Área privada", value: `${formatNumber(p.private_area_m2)} m²` }
      : false,
    p.total_area_m2 && p.total_area_m2 !== p.area_m2
      ? { label: "Área total", value: `${formatNumber(p.total_area_m2)} m²` }
      : false,
    p.stratum ? { label: "Estrato", value: String(p.stratum) } : false,
    p.floor !== null ? { label: "Piso", value: String(p.floor) } : false,
    p.storage_rooms ? { label: "Depósitos", value: String(p.storage_rooms) } : false,
    p.built_year ? { label: "Año de construcción", value: String(p.built_year) } : false,
    p.condition
      ? { label: "Estado", value: CONDITIONS[p.condition] ?? p.condition.replace(/_/g, " ") }
      : false,
    p.furnished !== null ? { label: "Amoblado", value: p.furnished ? "Sí" : "No" } : false,
    p.pet_friendly !== null
      ? { label: "Mascotas", value: p.pet_friendly ? "Permitidas" : "No permitidas" }
      : false,
  ].filter(Boolean) as Fact[];

  if (facts.length === 0 && !p.available_from) return null;

  return (
    <section className="detail-section" aria-labelledby="facts-title">
      <h2 id="facts-title">Detalles</h2>
      {facts.length > 0 && (
        <div className="detail-feats">
          {facts.map((f) => (
            <Stat key={f.label} {...f} />
          ))}
        </div>
      )}
      {p.available_from && (
        <p className="detail-note">
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
