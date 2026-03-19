"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
  FileText,
  Layers,
  Building2,
  Users,
  BarChart2,
  MapPin,
} from "lucide-react";

/* ── Mini mockup: Excel chaos ── */
function ChaosPreview() {
  const rows = [
    ["Apto 201", "Chapinero", "2.800.000", "?"],
    ["Casa 45", "Poblado", "", "Carlos?"],
    ["Oficina 8B", "Usaquén", "3.2M", "pendiente"],
    ["Local 3", "???", "ver WA", "—"],
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
        {["Propiedad", "Ciudad", "Precio", "Agente"].map((h) => (
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

/* ── Mini mockup: Armio dashboard ── */
function ArmioPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1D9E75]/30 bg-white shadow-sm">
      {/* App header */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7] bg-[#F1EFE8] px-3 py-1.5">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-[#FF5F57]" />
          <div className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
          <div className="h-2 w-2 rounded-full bg-[#28C840]" />
        </div>
        <span className="text-[9px] text-[#5F5E5A]">app.armio.co</span>
        <div />
      </div>
      <div className="flex" style={{ height: "160px" }}>
        {/* Sidebar */}
        <div className="flex w-8 flex-shrink-0 flex-col items-center gap-1 border-r border-[#D3D1C7] bg-[#F1EFE8] py-2">
          {[Building2, Users, FileText, BarChart2].map((Icon, i) => (
            <div
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded ${i === 0 ? "bg-[#E1F5EE] text-[#0F6E56]" : "text-[#5F5E5A]"}`}
            >
              <Icon size={11} strokeWidth={1.5} />
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="flex flex-1 flex-col">
          <div className="grid grid-cols-3 gap-1 border-b border-[#D3D1C7] bg-[#F1EFE8] p-2">
            {[
              ["$12.5M", "Ventas"],
              ["8", "Leads"],
              ["37%", "Conversión"],
            ].map(([v, l]) => (
              <div key={l} className="rounded border border-[#D3D1C7] bg-white p-1 text-center">
                <p className="text-[10px] font-semibold text-[#0F6E56]">{v}</p>
                <p className="text-[8px] text-[#5F5E5A]">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-hidden bg-white">
            {[
              {
                name: "Apto 201",
                loc: "Chapinero",
                status: "Publicada",
                c: "bg-[#EAF3DE] text-[#3B6D11]",
              },
              {
                name: "Casa 45",
                loc: "El Poblado",
                status: "Verificada",
                c: "bg-[#E6F1FB] text-[#185FA5]",
              },
              {
                name: "Oficina 8B",
                loc: "Usaquén",
                status: "Reservada",
                c: "bg-[#FAEEDA] text-[#92400E]",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-1.5 border-b border-[#F1EFE8] px-2 py-1"
              >
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-[#E1F5EE]">
                  <MapPin size={8} className="text-[#0F6E56]" />
                </div>
                <span className="flex-1 text-[8px] font-medium text-[#2C2C2A]">{p.name}</span>
                <span className="text-[8px] text-[#5F5E5A]">{p.loc}</span>
                <span className={`rounded px-1 py-0.5 text-[7px] font-medium ${p.c}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ProblemSolution() {
  const [showSolution, setShowSolution] = useState(false);

  const problemItems = [
    { icon: FileSpreadsheet, text: "Propiedades dispersas en Excel y WhatsApp" },
    { icon: AlertCircle, text: "Leads perdidos en conversaciones personales" },
    { icon: X, text: "Contratos manuales y desorganizados" },
    { icon: AlertCircle, text: "Sin visibilidad del pipeline de ventas" },
    { icon: Layers, text: "10+ tabs abiertos todo el tiempo" },
  ];

  const solutionItems = [
    { icon: Layers, text: "Todo centralizado en un solo lugar" },
    { icon: CheckCircle, text: "Leads organizados y asignados a agentes" },
    { icon: FileText, text: "Contratos digitales automatizados" },
    { icon: BarChart2, text: "Dashboard con métricas en tiempo real" },
    { icon: CheckCircle, text: "Pipeline visual de cada propiedad" },
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
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium tracking-widest text-[#0F6E56] uppercase">
            El antes y el después
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-[#2C2C2A] md:text-4xl">
            ¿Te suena familiar?
          </h2>
          <p className="text-lg text-[#5F5E5A]">El caos de hoy vs el orden con Armio</p>
        </motion.div>

        {/* Toggle */}
        <div className="mb-12 flex justify-center">
          <button
            onClick={() => setShowSolution((v) => !v)}
            className="flex items-center gap-3 rounded-full border border-[#D3D1C7] bg-white px-6 py-3 shadow-sm transition-all duration-200 hover:bg-[#F1EFE8]"
          >
            <span
              className={`text-sm font-medium transition-colors ${showSolution ? "text-[#5F5E5A]" : "text-[#2C2C2A]"}`}
            >
              HOY
            </span>
            <div
              className={`relative h-6 w-10 rounded-full transition-colors duration-300 ${showSolution ? "bg-[#1D9E75]" : "bg-[#E24B4A]"}`}
            >
              <motion.div
                animate={{ left: showSolution ? "20px" : "4px" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
              />
            </div>
            <span
              className={`text-sm font-medium transition-colors ${showSolution ? "text-[#2C2C2A]" : "text-[#5F5E5A]"}`}
            >
              CON ARMIO
            </span>
          </button>
        </div>

        {/* Content panel */}
        <AnimatePresence mode="wait">
          {showSolution ? (
            <motion.div
              key="solution"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-[#1D9E75]/20 bg-[#E1F5EE] p-8 md:p-12"
            >
              <div className="grid items-center gap-8 md:grid-cols-2">
                <ArmioPreview />
                <div>
                  <h3 className="mb-6 text-xl font-semibold text-[#0F6E56]">Con Armio</h3>
                  <div className="space-y-3">
                    {solutionItems.map(({ icon: Icon, text }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <Icon
                          size={18}
                          className="mt-0.5 flex-shrink-0 text-[#0F6E56]"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-[#2C2C2A]">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="problem"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-[#E24B4A]/20 bg-[#FCEBEB] p-8 md:p-12"
            >
              <div className="grid items-center gap-8 md:grid-cols-2">
                <ChaosPreview />
                <div>
                  <h3 className="mb-6 text-xl font-semibold text-[#C13030]">Sin Armio</h3>
                  <div className="space-y-3">
                    {problemItems.map(({ icon: Icon, text }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <Icon
                          size={18}
                          className="mt-0.5 flex-shrink-0 text-[#C13030]"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-[#2C2C2A]">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
