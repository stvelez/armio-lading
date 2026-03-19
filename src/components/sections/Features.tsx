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
    <div className="mt-5 overflow-hidden rounded-lg border border-[#3C3C3A] bg-[#1A1A18]">
      <div className="flex items-center gap-2 border-b border-[#3C3C3A] bg-[#222220] px-3 py-2">
        <Building2 size={10} className="text-[#1D9E75]" />
        <span className="text-[9px] font-medium text-[#888780]">Propiedades</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-2 border-b border-[#2C2C2A] px-3 py-1.5 last:border-0"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#1D9E75]/10">
            <MapPin size={8} className="text-[#1D9E75]" />
          </div>
          <span className="flex-1 text-[9px] text-white">{r.name}</span>
          <span className="text-[9px] text-[#888780]">{r.price}</span>
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
    <div className="mt-5 overflow-hidden rounded-lg border border-[#3C3C3A] bg-[#1A1A18] p-3">
      <p className="mb-2 text-[9px] font-medium text-[#888780]">PIPELINE DE LEADS</p>
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
          <div key={name} className="flex items-center gap-2 rounded bg-[#222220] px-2 py-1">
            <div className="h-4 w-4 rounded-full bg-[#1D9E75]/20 text-center text-[8px] leading-4 text-[#1D9E75]">
              {name[0]}
            </div>
            <span className="text-[9px] text-[#B4B2A9]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewContratos() {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#3C3C3A] bg-[#1A1A18] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-[#888780]">CONTRATO — ARRENDAMIENTO</p>
        <span className="rounded bg-[#FAEEDA] px-1.5 py-0.5 text-[8px] font-medium text-[#92400E]">
          Pendiente
        </span>
      </div>
      <div className="space-y-1.5">
        {["Propiedad: Apto 201", "Valor: $2.800.000/mes", "Vigencia: 12 meses"].map((line) => (
          <div key={line} className="flex items-center gap-2 rounded bg-[#222220] px-2 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
            <span className="text-[9px] text-[#B4B2A9]">{line}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded border border-dashed border-[#3C3C3A] py-1.5 text-center text-[8px] text-[#888780]">
          ✍ Firma pendiente
        </div>
      </div>
    </div>
  );
}

function PreviewColombia() {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#3C3C3A] bg-[#1A1A18] p-3">
      <div className="mb-2 flex items-center gap-2">
        <DollarSign size={10} className="text-[#1D9E75]" />
        <p className="text-[9px] font-medium text-[#888780]">CONFIGURACIÓN REGIONAL</p>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Moneda", value: "COP — Peso colombiano" },
          { label: "Formato", value: "$1.200.000 / mes" },
          { label: "Regiones", value: "Bogotá, Medellín, Cali…" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded bg-[#222220] px-2 py-1"
          >
            <span className="text-[8px] text-[#888780]">{label}</span>
            <span className="text-[9px] font-medium text-[#B4B2A9]">{value}</span>
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
    delay: 0,
  },
  {
    icon: Users,
    title: "CRM de Leads",
    description:
      "Captura leads desde múltiples canales, asigna a agentes y sigue el pipeline de ventas.",
    Preview: PreviewCRM,
    delay: 0.15,
  },
  {
    icon: FileText,
    title: "Contratos Digitales",
    description:
      "Genera contratos con plantillas, envía para firma digital y rastrea el estado en tiempo real.",
    Preview: PreviewContratos,
    delay: 0.3,
  },
  {
    icon: Globe,
    title: "Hecho para Colombia",
    description: "Diseñado específicamente para cómo funciona el mercado inmobiliario colombiano.",
    Preview: PreviewColombia,
    delay: 0.45,
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#1A1A18] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#1D9E75] uppercase">
            Las funcionalidades
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-white md:text-4xl">
            Todo lo que tu agencia necesita
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#B4B2A9]">
            Un sistema completo pensado para agencias inmobiliarias colombianas.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, Preview, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay }}
              whileHover={{ scale: 1.02, y: -8 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#3C3C3A] bg-[#232321] p-6 transition-shadow duration-300 hover:border-[#1D9E75]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(29,158,117,0.15)]"
            >
              {/* Top glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D9E75]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D9E75]/10">
                <Icon size={20} className="text-[#1D9E75]" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-[#B4B2A9]">{description}</p>
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
