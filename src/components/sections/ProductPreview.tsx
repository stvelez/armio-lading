'use client';

import { useState } from 'react';
import { Info, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
}

const hotspots: Hotspot[] = [
  {
    id: '1',
    x: 15,
    y: 30,
    title: 'Propiedades',
    description: 'Gestiona tu cartera completa con fotos, videos y toda la información',
  },
  {
    id: '2',
    x: 50,
    y: 50,
    title: 'Pipeline',
    description: 'Visualiza cada lead y su progreso en tiempo real',
  },
  {
    id: '3',
    x: 85,
    y: 35,
    title: 'Métricas',
    description: 'Dashboard con KPIs clave de tu agencia',
  },
];

export default function ProductPreview() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="text-[#1D9E75] text-sm font-medium mb-3 uppercase tracking-wide">
            El producto
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2C2C2A] mb-4">
            Mira cómo funciona Armio
          </h2>
          <p className="text-[#5F5E5A] text-lg">
            Todo tu negocio inmobiliario, en un solo lugar
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          {/* Dashboard mockup */}
          <div className="relative aspect-[2/1] bg-white rounded-2xl overflow-hidden border border-[#D3D1C7] shadow-xl">
            {/* Sidebar mock */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-[#F1EFE8] border-r border-[#D3D1C7] flex flex-col items-center py-4 gap-3">
              <div className="w-8 h-8 bg-[#1D9E75] rounded-lg" />
              <div className="w-8 h-8 bg-[#D3D1C7] rounded-lg" />
              <div className="w-8 h-8 bg-[#D3D1C7] rounded-lg" />
              <div className="w-8 h-8 bg-[#D3D1C7] rounded-lg" />
              <div className="w-8 h-8 bg-[#D3D1C7] rounded-lg" />
            </div>

            {/* Content area mock */}
            <div className="ml-16 p-6 h-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="h-7 bg-[#F1EFE8] rounded w-40" />
                <div className="h-7 bg-[#1D9E75] rounded w-28" />
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#F1EFE8] border border-[#D3D1C7] rounded-lg p-4">
                    <div className="h-3 bg-[#D3D1C7] rounded w-20 mb-2" />
                    <div className="h-7 bg-[#1D9E75]/30 rounded w-14" />
                  </div>
                ))}
              </div>

              {/* Table header */}
              <div className="h-8 bg-[#F1EFE8] rounded mb-1 flex items-center px-3 border border-[#D3D1C7]">
                <div className="h-2.5 bg-[#B4B2A9] rounded w-16" />
              </div>

              {/* Properties table */}
              <div className="bg-white rounded-lg border border-[#D3D1C7]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-3 px-4 border-b border-[#F1EFE8] last:border-0">
                    <div className="w-10 h-10 bg-[#E1F5EE] rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-[#D3D1C7] rounded w-32 mb-1.5" />
                      <div className="h-2 bg-[#F1EFE8] rounded w-24" />
                    </div>
                    <div className="h-6 bg-[#EAF3DE] rounded-full w-20 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspots */}
            {hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() => setActiveHotspot(hotspot.id === activeHotspot ? null : hotspot.id)}
                className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  activeHotspot === hotspot.id
                    ? 'bg-[#1D9E75] border-[#1D9E75] scale-110'
                    : 'bg-white border-[#1D9E75] hover:bg-[#E1F5EE]'
                }`}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                aria-label={`Ver información de ${hotspot.title}`}
              >
                <Info size={14} className={activeHotspot === hotspot.id ? 'text-white' : 'text-[#1D9E75]'} />
              </button>
            ))}
          </div>

          {/* Active Hotspot Tooltip */}
          <AnimatePresence>
            {activeHotspot && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white border border-[#D3D1C7] rounded-xl p-4 z-10 shadow-lg"
              >
                <h4 className="text-[#2C2C2A] font-semibold mb-1 text-sm">
                  {hotspots.find((h) => h.id === activeHotspot)?.title}
                </h4>
                <p className="text-[#5F5E5A] text-sm">
                  {hotspots.find((h) => h.id === activeHotspot)?.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-6 py-3 rounded-md text-sm font-medium transition-colors duration-150">
            <Play size={16} />
            Ver demo completa
          </button>
        </div>
      </div>
    </section>
  );
}
