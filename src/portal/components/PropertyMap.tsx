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
    <section aria-labelledby="map-title">
      <h2 id="map-title" className="text-xl font-semibold text-stone-900">
        Ubicación
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
        {open ? (
          <iframe
            title={`Mapa de ${title}`}
            src={src}
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex h-72 flex-col items-center justify-center gap-3 px-4 text-center">
            <MapPin className="h-8 w-8 text-stone-500" aria-hidden />
            <p className="max-w-sm text-sm text-stone-700">
              Al ver el mapa se cargará contenido de OpenStreetMap, un servicio externo.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="bg-portal text-on-portal h-10 rounded-lg px-4 text-sm font-semibold"
            >
              Ver mapa
            </button>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-stone-600">
        {exact
          ? "Ubicación del inmueble."
          : "Ubicación aproximada: la dirección exacta se comparte al contactar a la inmobiliaria."}{" "}
        <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
          Abrir en OpenStreetMap
        </a>
      </p>
    </section>
  );
}
