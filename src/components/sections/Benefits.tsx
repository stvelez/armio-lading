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
    detail: "Eso son más de 500 horas al año recuperadas para tu operación",
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
    detail: "Plantillas de contratos para el mercado colombiano",
    delay: 0.3,
  },
];

export default function Benefits() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
            El impacto real
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-[#111827] md:text-4xl">
            Resultados que importan
          </h2>
          <p className="mx-auto max-w-lg text-base text-[#4B5563]">
            Armio está diseñado para generar resultados medibles desde el primer día.
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
              whileHover={{ scale: 1.025, y: -10 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-8 transition-all duration-300 hover:border-[#00C47A]/40 hover:shadow-[0_12px_40px_rgba(0,196,122,0.08),0_4px_12px_rgba(0,0,0,0.06)]"
            >
              {/* Top accent line on hover */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-[#00C47A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Icon */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D6FFF0]">
                <Icon size={24} className="text-[#00965E]" strokeWidth={1.5} />
              </div>

              {/* Metric */}
              <div className="mb-1 flex items-end gap-2">
                <span
                  className="text-6xl font-bold tracking-[-0.04em] text-[#111827]"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  {metric}
                </span>
                <span className="mb-1 text-sm font-semibold text-[#00C47A]">{unit}</span>
              </div>

              {/* Title + subtext */}
              <h3 className="mb-2 text-lg font-semibold text-[#111827]">{title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#4B5563]">{subtext}</p>

              {/* Detail pill */}
              <div className="mt-auto rounded-lg border border-[#E5E7EB] bg-[#F0FDF8] px-3 py-2">
                <p className="text-xs text-[#00965E]">{detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
