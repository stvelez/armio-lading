"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, Zap } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    metric: "10+",
    unit: "horas / semana",
    title: "Ahorra tiempo valioso",
    subtext: "Automatiza tareas repetitivas y enfócate en vender más",
    detail: "Eso son más de 500 horas al año para tu equipo",
    delay: 0,
  },
  {
    icon: TrendingUp,
    metric: "30%",
    unit: "más conversiones",
    title: "Convierte más leads",
    subtext: "Nunca pierdas un lead por falta de seguimiento",
    detail: "Pipeline automático con recordatorios integrados",
    delay: 0.15,
  },
  {
    icon: Zap,
    metric: "2x",
    unit: "más rápido",
    title: "Cierra contratos antes",
    subtext: "Procesos digitales que eliminan fricción",
    detail: "Firma digital con plantillas para el mercado colombiano",
    delay: 0.3,
  },
];

export default function Benefits() {
  return (
    <section className="bg-[#2C2C2A] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium tracking-widest text-[#1D9E75] uppercase">
            El impacto real
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-white md:text-4xl">
            Resultados que importan
          </h2>
          <p className="mx-auto max-w-lg text-base text-[#B4B2A9]">
            Agencias que usan Armio reportan mejoras medibles desde la primera semana.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map(({ icon: Icon, metric, unit, title, subtext, detail, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay }}
              whileHover={{ scale: 1.02, y: -6 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#3C3C3A] bg-[#232321] p-8 transition-shadow duration-300 hover:border-[#1D9E75]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            >
              {/* Top glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D9E75]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Icon */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D9E75]/10">
                <Icon size={24} className="text-[#1D9E75]" strokeWidth={1.5} />
              </div>

              {/* Metric */}
              <div className="mb-1 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-[-0.03em] text-white">{metric}</span>
                <span className="mb-1 text-sm font-medium text-[#1D9E75]">{unit}</span>
              </div>

              {/* Title + subtext */}
              <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#B4B2A9]">{subtext}</p>

              {/* Detail pill */}
              <div className="mt-auto rounded-lg border border-[#3C3C3A] bg-[#1A1A18] px-3 py-2">
                <p className="text-xs text-[#888780]">{detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
