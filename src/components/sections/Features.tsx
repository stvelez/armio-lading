"use client";

import { motion } from "framer-motion";
import { Building2, Users, FileText, Globe, MapPin, DollarSign } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay },
});

/* ── Mini preview components ── */

function PreviewProperties() {
  const rows = [
    { name: "Apto 201", price: "$2.8M", status: "Publicada", color: "bg-[#EAF3DE] text-[#3B6D11]" },
    { name: "Casa 45", price: "$4.5M", status: "Verificada", color: "bg-[#E6F1FB] text-[#185FA5]" },
    {
      name: "Oficina 8B",
      price: "$3.2M",
      status: "Reservada",
      color: "bg-[#FAEEDA] text-[#92400E]",
    },
  ];
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#D3D1C7] bg-[#F1EFE8]">
      <div className="flex items-center gap-2 border-b border-[#D3D1C7] bg-white px-3 py-2">
        <Building2 size={10} className="text-[#1D9E75]" />
        <span className="text-[9px] font-medium text-[#5F5E5A]">Propiedades</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-2 border-b border-[#E8E6DF] px-3 py-1.5 last:border-0"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#E1F5EE]">
            <MapPin size={8} className="text-[#1D9E75]" />
          </div>
          <span className="flex-1 text-[9px] text-[#2C2C2A]">{r.name}</span>
          <span className="text-[9px] text-[#5F5E5A]">{r.price}</span>
          <span className={`rounded px-1.5 py-0.5 text-[8px] font-medium ${r.color}`}>
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function PreviewCRM() {
  const stages = [
    { label: "Nuevo", count: 4, color: "border-[#185FA5] text-[#185FA5]" },
    { label: "Seguimiento", count: 2, color: "border-[#BA7517] text-[#BA7517]" },
    { label: "Cerrado", count: 1, color: "border-[#3B6D11] text-[#3B6D11]" },
  ];
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#D3D1C7] bg-[#F1EFE8] p-3">
      <p className="mb-2 text-[9px] font-medium text-[#5F5E5A]">PIPELINE DE LEADS</p>
      <div className="grid grid-cols-3 gap-1.5">
        {stages.map((s) => (
          <div key={s.label} className={`rounded-md border p-2 text-center ${s.color}`}>
            <p className="text-sm font-semibold">{s.count}</p>
            <p className="text-[8px]">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {["Carlos M. — Busca apto", "Luz G. — Interesada casa"].map((name) => (
          <div key={name} className="flex items-center gap-2 rounded bg-white px-2 py-1">
            <div className="h-4 w-4 rounded-full bg-[#1D9E75]/20 text-center text-[8px] leading-4 text-[#1D9E75]">
              {name[0]}
            </div>
            <span className="text-[9px] text-[#5F5E5A]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewContratos() {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#D3D1C7] bg-[#F1EFE8] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-[#5F5E5A]">CONTRATO — ARRENDAMIENTO</p>
        <span className="rounded bg-[#FAEEDA] px-1.5 py-0.5 text-[8px] font-medium text-[#92400E]">
          Pendiente
        </span>
      </div>
      <div className="space-y-1.5">
        {["Propiedad: Apto 201", "Valor: $2.800.000/mes", "Vigencia: 12 meses"].map((line) => (
          <div key={line} className="flex items-center gap-2 rounded bg-white px-2 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
            <span className="text-[9px] text-[#5F5E5A]">{line}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded border border-dashed border-[#D3D1C7] py-1.5 text-center text-[8px] text-[#5F5E5A]">
          ✍ Firma pendiente
        </div>
      </div>
    </div>
  );
}

function PreviewColombia() {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#D3D1C7] bg-[#F1EFE8] p-3">
      <div className="mb-2 flex items-center gap-2">
        <DollarSign size={10} className="text-[#1D9E75]" />
        <p className="text-[9px] font-medium text-[#5F5E5A]">CONFIGURACIÓN REGIONAL</p>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Moneda", value: "COP — Peso colombiano" },
          { label: "Formato", value: "$1.200.000 / mes" },
          { label: "Regiones", value: "Bogotá, Medellín, Cali…" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between rounded bg-white px-2 py-1">
            <span className="text-[8px] text-[#5F5E5A]">{label}</span>
            <span className="text-[9px] font-medium text-[#5F5E5A]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature data ── */

const features = [
  {
    icon: Building2,
    title: "Gestión de Propiedades",
    description:
      "Crea, edita y publica propiedades con fotos, videos y toda la información que necesitas.",
    Preview: PreviewProperties,
    comingSoon: false,
    delay: 0,
  },
  {
    icon: Users,
    title: "CRM de Leads",
    description:
      "Captura leads desde múltiples canales, asigna a agentes y sigue el pipeline de ventas.",
    Preview: PreviewCRM,
    comingSoon: false,
    delay: 0.15,
  },
  {
    icon: FileText,
    title: "Contratos Digitales",
    description:
      "Genera contratos con plantillas y rastrea el estado en tiempo real. Firma digital próximamente.",
    Preview: PreviewContratos,
    comingSoon: true,
    delay: 0.3,
  },
  {
    icon: Globe,
    title: "Hecho para Colombia",
    description: "Diseñado específicamente para cómo funciona el mercado inmobiliario colombiano.",
    Preview: PreviewColombia,
    comingSoon: false,
    delay: 0.45,
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#1D9E75] uppercase">
            Las funcionalidades
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-[#2C2C2A] md:text-4xl">
            Todo lo que tu agencia necesita
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#5F5E5A]">
            Un sistema completo pensado para agencias inmobiliarias colombianas.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, Preview, comingSoon, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay }}
              whileHover={{ scale: 1.02, y: -8 }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[#D3D1C7] bg-white p-6 transition-shadow duration-300 hover:border-[#1D9E75]/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(29,158,117,0.15)] ${comingSoon ? "opacity-80" : ""}`}
            >
              {/* Top glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D9E75]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Badge Próximamente */}
              {comingSoon && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-[#E1F5EE] px-2.5 py-1 text-[10px] font-semibold text-[#0F6E56]">
                    Próximamente
                  </span>
                </div>
              )}

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E1F5EE]">
                <Icon size={20} className="text-[#1D9E75]" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#2C2C2A]">{title}</h3>
              <p className="text-sm leading-relaxed text-[#5F5E5A]">{description}</p>
              <div className="hidden sm:block">
                <Preview />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
