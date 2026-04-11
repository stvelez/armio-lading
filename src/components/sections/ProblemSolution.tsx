"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, X, FileSpreadsheet, Layers, AlertTriangle } from "lucide-react";

/* ── Mini mockup: Excel chaos ── */
function ChaosPreview() {
  const rows = [
    ["Apto 201", "Chapinero", "2.800.000", "?"],
    ["Casa 45", "Poblado", "", "Carlos?"],
    ["Oficina 8B", "Usaquén", "3.2M", "pendiente"],
    ["Local 3", "???", "ver WA", "—"],
    ["Bodega 7", "Fontibón", "", "?"],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
      {/* Excel-like header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-[#217346] px-3 py-1.5">
        <FileSpreadsheet size={12} className="text-white" />
        <span className="text-[10px] font-medium text-white">propiedades_FINAL_v3.xlsx</span>
      </div>
      {/* Sheet tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-gray-100 px-2">
        {["Enero", "Febrero", "Hoja3"].map((t, i) => (
          <div
            key={t}
            className={`px-2 py-1 text-[8px] ${i === 0 ? "border-x border-gray-300 bg-white font-medium text-gray-700" : "text-gray-600"}`}
          >
            {t}
          </div>
        ))}
      </div>
      {/* Header row */}
      <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50 px-1">
        {["Propiedad", "Ciudad", "Precio", "Estado"].map((h) => (
          <div
            key={h}
            className="border-r border-gray-200 px-1.5 py-1 text-[8px] font-semibold text-gray-500 last:border-0"
          >
            {h}
          </div>
        ))}
      </div>
      {/* Data rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-4 border-b border-gray-100 px-1 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
        >
          {row.map((cell, j) => (
            <div
              key={j}
              className={`border-r border-gray-100 px-1.5 py-1 text-[8px] last:border-0 ${cell === "?" || cell === "???" || cell === "ver WA" ? "font-medium text-red-700" : "text-gray-600"}`}
            >
              {cell || <span className="text-red-700">—vacío—</span>}
            </div>
          ))}
        </div>
      ))}
      {/* WhatsApp thread hint */}
      <div className="flex items-center gap-2 border-t border-gray-200 bg-[#dcf8c6] px-3 py-1.5">
        <div className="h-2 w-2 rounded-full bg-[#25D366]" />
        <span className="text-[9px] text-gray-600">
          WhatsApp: &ldquo;Carlos cuál era el precio del apto 201?&rdquo;
        </span>
      </div>
    </div>
  );
}

/* ── Real screenshot: Armio dashboard ── */
function ArmioPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1D9E75]/30 bg-white shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7] bg-[#F1EFE8] px-3 py-1.5">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-[#FF5F57]" />
          <div className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
          <div className="h-2 w-2 rounded-full bg-[#28C840]" />
        </div>
        <span className="text-[9px] text-[#5F5E5A]">app.armio.co</span>
        <div />
      </div>
      {/* Screenshot */}
      <div className="relative w-full">
        <Image
          src="/screenshots/01-dashboard.jpg"
          alt="Dashboard de Armio — vista general con métricas, propiedades y pipeline de leads"
          width={1400}
          height={860}
          className="w-full object-cover object-top"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ProblemSolution() {
  const problemItems = [
    { icon: FileSpreadsheet, text: "Propiedades dispersas en Excel y WhatsApp" },
    { icon: AlertTriangle, text: "Leads sin seguimiento claro ni recordatorios" },
    { icon: X, text: "Contratos manuales y desorganizados" },
    { icon: AlertTriangle, text: "Poca visibilidad del trabajo diario y lo pendiente" },
    { icon: Layers, text: "Demasiadas pestañas y chats para operar con calma" },
  ];

  const solutionItems = [
    { icon: CheckCircle2, text: "Todo centralizado en un solo lugar" },
    { icon: CheckCircle2, text: "Leads organizados con seguimiento visible" },
    { icon: CheckCircle2, text: "Contratos digitales y documentos en orden" },
    { icon: CheckCircle2, text: "Dashboard con métricas en tiempo real" },
    { icon: CheckCircle2, text: "Una base lista para operar solo o crecer con equipo" },
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-sm font-medium tracking-[0.12em] text-[#0F6E56] uppercase">
            El antes y el después
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-[#2C2C2A] md:text-4xl">
            ¿Te suena familiar?
          </h2>
          <p className="mx-auto max-w-md text-base text-balance text-[#5F5E5A]">
            Si hoy operas entre Excel, WhatsApp y memoria, Armio te devuelve control sin
            complicarte.
          </p>
        </motion.div>

        {/* Side-by-side comparison */}
        <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-start">
          {/* Card ANTES */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-red-200/60 bg-[#FDF2F2] p-6 md:p-8"
          >
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                <X size={12} className="text-[#C13030]" strokeWidth={2.5} />
              </div>
              <h3 className="text-base font-semibold text-[#C13030]">Sin Armio</h3>
            </div>
            <div className="mb-6">
              <ChaosPreview />
            </div>
            <div className="space-y-3">
              {problemItems.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <Icon
                    size={16}
                    className="mt-0.5 flex-shrink-0 text-[#C13030]"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-[#2C2C2A]">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* VS badge — desktop only */}
          <div className="hidden items-center justify-center pt-20 md:flex">
            <span className="rounded-full border border-[#D3D1C7] bg-[#F1EFE8] px-3 py-1.5 text-xs font-semibold text-[#5F5E5A]">
              VS
            </span>
          </div>

          {/* Card DESPUÉS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-[#1D9E75]/25 bg-[#EAF6F1] p-6 md:p-8"
          >
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D1EDE3]">
                <CheckCircle2 size={12} className="text-[#0F6E56]" strokeWidth={2.5} />
              </div>
              <h3 className="text-base font-semibold text-[#0F6E56]">Con Armio</h3>
            </div>
            <div className="mb-6">
              <ArmioPreview />
            </div>
            <div className="space-y-3">
              {solutionItems.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 + 0.15, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <Icon
                    size={16}
                    className="mt-0.5 flex-shrink-0 text-[#0F6E56]"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-[#2C2C2A]">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
