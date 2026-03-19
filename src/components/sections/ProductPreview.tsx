"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Building2,
  Users,
  FileText,
  BarChart2,
  MapPin,
  TrendingUp,
  Plus,
  ChevronRight,
} from "lucide-react";
import Hotspot from "@/components/ui/Hotspot";
import DemoVideo from "@/components/ui/DemoVideo";

/* ── Mini dashboard mockup ── */
function DashboardMockup() {
  const properties = [
    {
      name: "Apto 201",
      loc: "Chapinero · Bogotá",
      price: "$280M",
      status: "Publicada",
      sc: "bg-[#EAF3DE] text-[#3B6D11]",
    },
    {
      name: "Casa El Poblado",
      loc: "El Poblado · Medellín",
      price: "$620M",
      status: "Verificada",
      sc: "bg-[#E6F1FB] text-[#185FA5]",
    },
    {
      name: "Oficina 8B",
      loc: "Usaquén · Bogotá",
      price: "$320M",
      status: "Reservada",
      sc: "bg-[#FAEEDA] text-[#92400E]",
    },
  ];

  const pipeline = [
    { label: "Nuevo", count: 3, color: "bg-[#E6F1FB] text-[#185FA5] border-[#BFDBFE]" },
    { label: "En proceso", count: 2, color: "bg-[#FAEEDA] text-[#92400E] border-[#FDE68A]" },
    { label: "Cerrado", count: 1, color: "bg-[#EAF3DE] text-[#3B6D11] border-[#BBF7D0]" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D3D1C7] bg-white shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-[#D3D1C7] bg-white px-3 py-0.5">
          <div className="h-2 w-2 rounded-full bg-[#1D9E75]" />
          <span className="text-[11px] text-[#888780]">app.armio.co</span>
        </div>
        <div className="w-16" />
      </div>

      {/* App layout */}
      <div className="flex" style={{ minHeight: "480px" }}>
        {/* Sidebar */}
        <div className="flex w-14 flex-shrink-0 flex-col items-center gap-1.5 border-r border-[#D3D1C7] bg-[#F1EFE8] py-4">
          {/* Logo */}
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F6E56]">
            <span className="text-[10px] font-bold text-white">A</span>
          </div>
          {[
            { Icon: Building2, active: true },
            { Icon: Users, active: false },
            { Icon: FileText, active: false },
            { Icon: BarChart2, active: false },
          ].map(({ Icon, active }, i) => (
            <div
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                active ? "bg-[#0F6E56] text-white shadow-sm" : "text-[#5F5E5A] hover:bg-[#E8E6DF]"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col bg-[#FAFAF8]">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-white px-5 py-3">
            <div>
              <h3 className="text-sm font-semibold text-[#2C2C2A]">Propiedades</h3>
              <p className="text-[11px] text-[#5F5E5A]">3 propiedades activas</p>
            </div>
            <button
              tabIndex={-1}
              className="flex items-center gap-1.5 rounded-lg bg-[#0F6E56] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm"
            >
              <Plus size={11} strokeWidth={2} />
              Nueva
            </button>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            {/* Metrics */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              {[
                { label: "Ventas del mes", value: "$12.5M", change: "+18%", up: true },
                { label: "Leads activos", value: "8", change: "+3 nuevos", up: true },
                { label: "Tasa conversión", value: "37%", change: "+5%", up: true },
              ].map(({ label, value, change, up }) => (
                <div
                  key={label}
                  className="rounded-xl border border-[#E8E6DF] bg-white p-3 shadow-sm"
                >
                  <p className="mb-1 text-[10px] text-[#5F5E5A]">{label}</p>
                  <p className="text-base font-bold text-[#2C2C2A]">{value}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <TrendingUp size={9} className={up ? "text-[#0F6E56]" : "text-[#E24B4A]"} />
                    <span
                      className={`text-[9px] font-medium ${up ? "text-[#0F6E56]" : "text-[#E24B4A]"}`}
                    >
                      {change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Properties table */}
            <div className="mb-3 overflow-hidden rounded-xl border border-[#E8E6DF] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1EFE8] px-3 py-2">
                <span className="text-[11px] font-semibold text-[#2C2C2A]">
                  Cartera de propiedades
                </span>
                <button
                  tabIndex={-1}
                  className="flex items-center gap-0.5 text-[10px] text-[#0F6E56]"
                >
                  Ver todas <ChevronRight size={10} />
                </button>
              </div>
              {properties.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-2.5 border-b border-[#F8F7F4] px-3 py-2 last:border-0 hover:bg-[#FAFAF8]"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#E1F5EE]">
                    <MapPin size={11} className="text-[#0F6E56]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-[#2C2C2A]">{p.name}</p>
                    <p className="text-[10px] text-[#888780]">{p.loc}</p>
                  </div>
                  <span className="flex-shrink-0 text-[11px] font-semibold text-[#2C2C2A]">
                    {p.price}
                  </span>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${p.sc}`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Pipeline */}
            <div className="overflow-hidden rounded-xl border border-[#E8E6DF] bg-white shadow-sm">
              <div className="border-b border-[#F1EFE8] px-3 py-2">
                <span className="text-[11px] font-semibold text-[#2C2C2A]">Pipeline de leads</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#F1EFE8] px-0">
                {pipeline.map(({ label, count, color }) => (
                  <div key={label} className="flex flex-col items-center py-3">
                    <span
                      className={`mb-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${color}`}
                    >
                      {label}
                    </span>
                    <span className="text-lg font-bold text-[#2C2C2A]">{count}</span>
                    <span className="text-[9px] text-[#888780]">leads</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main section ── */
export default function ProductPreview() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="bg-[#1D9E75] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-medium tracking-widest text-[#E1F5EE] uppercase">
            Mira cómo funciona Armio
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-white md:text-4xl">
            Todo tu negocio inmobiliario, <span className="text-[#E1F5EE]">en un solo lugar</span>
          </h2>
          <p className="text-lg text-[#E1F5EE]">
            Explora el dashboard interactivo y ve cada feature en acción
          </p>
        </motion.div>

        {/* Dashboard + hotspots */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div aria-hidden="true">
            <DashboardMockup />
          </div>

          {/* Hotspot 1: over properties table */}
          <Hotspot
            x={42}
            y={62}
            title="Gestión de propiedades"
            description="Gestiona tu cartera completa con fotos, videos y toda la información centralizada."
          />
          {/* Hotspot 2: over pipeline */}
          <Hotspot
            x={72}
            y={88}
            title="Pipeline de leads"
            description="Visualiza cada lead y su progreso en tiempo real. Nunca pierdas un cliente."
          />
          {/* Hotspot 3: over metrics */}
          <Hotspot
            x={72}
            y={30}
            title="Métricas en tiempo real"
            description="Dashboard con KPIs clave de tu agencia: ventas, conversión y leads activos."
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0F6E56] shadow-md transition-all duration-200 hover:bg-[#F1EFE8] active:scale-95"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E1F5EE] transition-colors group-hover:bg-[#D3D1C7]">
              <Play size={11} className="ml-0.5" />
            </span>
            Ver demo completa
          </button>
        </motion.div>
      </div>

      <DemoVideo isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
}
