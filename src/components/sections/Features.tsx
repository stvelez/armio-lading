"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Building2, Users, FileText, Globe, MapPin, DollarSign } from "lucide-react";
import { trackFeatureHover } from "@/lib/analytics";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay },
});

/* ── Mini preview components — dark theme ── */

function PreviewProperties() {
  const rows = [
    {
      name: "Apto 201",
      price: "$2.8M",
      status: "Publicada",
      color: "bg-[#EAF3DE]/20 text-[#86EFAC]",
    },
    {
      name: "Casa 45",
      price: "$4.5M",
      status: "Verificada",
      color: "bg-[#E6F1FB]/20 text-[#93C5FD]",
    },
    {
      name: "Oficina 8B",
      price: "$3.2M",
      status: "Reservada",
      color: "bg-[#FAEEDA]/20 text-[#FCD34D]",
    },
  ];
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#21262D] bg-[#0D1117]">
      <div className="flex items-center gap-2 border-b border-[#21262D] bg-[#161B22] px-3 py-2">
        <Building2 size={10} className="text-[#00C47A]" />
        <span className="text-[9px] font-medium text-[#8B949E]">Propiedades</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-2 border-b border-[#21262D] px-3 py-1.5 last:border-0"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#00C47A]/10">
            <MapPin size={8} className="text-[#00C47A]" />
          </div>
          <span className="flex-1 text-[9px] text-[#F0F6FC]">{r.name}</span>
          <span className="text-[9px] text-[#8B949E]">{r.price}</span>
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
    { label: "Nuevo", count: 4, color: "border-[#93C5FD]/40 text-[#93C5FD]" },
    { label: "Seguimiento", count: 2, color: "border-[#FCD34D]/40 text-[#FCD34D]" },
    { label: "Cerrado", count: 1, color: "border-[#00C47A]/40 text-[#00C47A]" },
  ];
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#21262D] bg-[#0D1117] p-3">
      <p className="mb-2 text-[9px] font-medium text-[#8B949E]">PIPELINE DE LEADS</p>
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
          <div key={name} className="flex items-center gap-2 rounded bg-[#161B22] px-2 py-1">
            <div className="h-4 w-4 rounded-full bg-[#00C47A]/20 text-center text-[8px] leading-4 text-[#00C47A]">
              {name[0]}
            </div>
            <span className="text-[9px] text-[#8B949E]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewContratos() {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#21262D] bg-[#0D1117] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-[#8B949E]">CONTRATO — ARRENDAMIENTO</p>
        <span className="rounded bg-[#FCD34D]/10 px-1.5 py-0.5 text-[8px] font-medium text-[#FCD34D]">
          Pendiente
        </span>
      </div>
      <div className="space-y-1.5">
        {["Propiedad: Apto 201", "Valor: $2.800.000/mes", "Vigencia: 12 meses"].map((line) => (
          <div key={line} className="flex items-center gap-2 rounded bg-[#161B22] px-2 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00C47A]" />
            <span className="text-[9px] text-[#8B949E]">{line}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded border border-dashed border-[#21262D] py-1.5 text-center text-[8px] text-[#8B949E]">
          ✍ Firma pendiente
        </div>
      </div>
    </div>
  );
}

function PreviewColombia() {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#21262D] bg-[#0D1117] p-3">
      <div className="mb-2 flex items-center gap-2">
        <DollarSign size={10} className="text-[#00C47A]" />
        <p className="text-[9px] font-medium text-[#8B949E]">CONFIGURACIÓN REGIONAL</p>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Moneda", value: "COP — Peso colombiano" },
          { label: "Formato", value: "$1.200.000 / mes" },
          { label: "Regiones", value: "Bogotá, Medellín, Cali…" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded bg-[#161B22] px-2 py-1"
          >
            <span className="text-[8px] text-[#484F58]">{label}</span>
            <span className="text-[9px] font-medium text-[#8B949E]">{value}</span>
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
      "Captura leads desde múltiples canales, haz seguimiento sin perder conversaciones y ordena tu pipeline.",
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
  const trackedFeaturesRef = useRef(new Set<string>());

  const handleFeatureHover = (title: string) => {
    if (trackedFeaturesRef.current.has(title)) {
      return;
    }

    trackedFeaturesRef.current.add(title);
    trackFeatureHover(title);
  };

  return (
    <section id="features" className="bg-[#0D1117] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
            Las funcionalidades
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-[#F0F6FC] md:text-4xl">
            Todo lo que necesitas para operar con orden
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#8B949E]">
            Un sistema completo para independientes y equipos inmobiliarios que quieren trabajar
            mejor desde hoy.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, Preview, comingSoon, delay }) => (
            <motion.div
              key={title}
              onMouseEnter={() => handleFeatureHover(title)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay }}
              whileHover={{ scale: 1.025, y: -10 }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[#21262D] bg-[#161B22] p-6 transition-all duration-300 hover:border-[#00C47A]/30 hover:shadow-[0_0_0_1px_rgba(0,196,122,0.2),0_8px_32px_rgba(0,0,0,0.4)] ${comingSoon ? "opacity-80" : ""}`}
            >
              {/* Top glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00C47A]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Badge Próximamente */}
              {comingSoon && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full border border-[#00C47A]/20 bg-[#00C47A]/10 px-2.5 py-1 text-[10px] font-semibold text-[#00C47A]">
                    Próximamente
                  </span>
                </div>
              )}

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C47A]/10">
                <Icon size={20} className="text-[#00C47A]" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#F0F6FC]">{title}</h3>
              <p className="text-sm leading-relaxed text-[#8B949E]">{description}</p>
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
