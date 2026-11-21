"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

interface Props {
  latitude: number;
  longitude: number;
  /** Solo en modo exacto el pin es el real; en los demás es aproximado. */
  exact: boolean;
  title: string;
}

/** Mapa de OpenStreetMap: el iframe (y la conexión a terceros) solo se crea tras un clic. */
export default function PropertyMap({ latitude, longitude, exact, title }: Props) {
  const [open, setOpen] = useState(false);
  const d = 0.006;
  const bbox = [longitude - d, latitude - d, longitude + d, latitude + d]
    .map((n) => n.toFixed(6))
    .join("%2C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude.toFixed(6)}%2C${longitude.toFixed(6)}`;
  const link = `https://www.openstreetmap.org/?mlat=${latitude.toFixed(6)}&mlon=${longitude.toFixed(6)}#map=16/${latitude.toFixed(6)}/${longitude.toFixed(6)}`;

  return (
    <section className="detail-section" aria-labelledby="map-title">
      <h2 id="map-title">Ubicación</h2>
      <div className="map-box">
        {open ? (
          <iframe
            title={`Mapa de ${title}`}
            src={src}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="map-empty">
            <MapPin className="od-icon" aria-hidden />
            <p>Al ver el mapa se cargará contenido de OpenStreetMap, un servicio externo.</p>
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
              Ver mapa
            </button>
          </div>
        )}
      </div>
      <p className="map-note">
        {exact
          ? "Ubicación del inmueble."
          : "Ubicación aproximada: la dirección exacta se comparte al contactar a la inmobiliaria."}{" "}
        <a href={link} target="_blank" rel="noopener noreferrer">
          Abrir en OpenStreetMap
        </a>
      </p>
    </section>
  );
}
