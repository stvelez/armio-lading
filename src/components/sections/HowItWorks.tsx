"use client";

import { motion } from "framer-motion";
import { UserPlus, Upload, Target, ArrowRight, ChevronDown } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crea tu cuenta",
    description: "Regístrate en segundos, sin tarjeta de crédito",
    detail: "Setup en menos de 2 minutos",
  },
  {
    number: "02",
    icon: Upload,
    title: "Importa tu cartera",
    description: "Sube tus propiedades desde Excel o créalas desde cero",
    detail: "Importa 100+ propiedades en minutos",
  },
  {
    number: "03",
    icon: Target,
    title: "Empieza a vender",
    description: "Captura leads, gestiona contratos y cierra más ventas",
    detail: "Primeras conversiones en menos de 24h",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F9FAFB] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
            Simple de empezar
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-[#111827] md:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="text-lg text-[#4B5563]">
            En 3 simples pasos, ordena tu operación y empieza a crecer
          </p>
        </motion.div>

        {/* Steps — desktop: horizontal row; mobile: vertical stack */}
        <div className="flex flex-col items-center gap-0 md:flex-row md:items-stretch md:gap-0">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex w-full flex-col items-center md:flex-row md:items-center"
            >
              {/* Step card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                whileHover={{ scale: 1.025, y: -10 }}
                className="group relative flex w-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm transition-all duration-300 hover:border-[#00C47A]/35 hover:shadow-[0_8px_28px_rgba(0,196,122,0.08)] md:max-w-[280px]"
              >
                {/* Top accent line on hover */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-[#00C47A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Step number — editorial Fraunces */}
                <span
                  className="mb-4 text-5xl font-bold tracking-[-0.04em] text-[#00C47A]/20"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D6FFF0]">
                  <step.icon size={22} className="text-[#00965E]" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-[#111827]">{step.title}</h3>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-[#4B5563]">{step.description}</p>

                {/* Detail pill */}
                <div className="mt-auto rounded-lg border border-[#E5E7EB] bg-[#F0FDF8] px-3 py-2">
                  <p className="text-xs font-medium text-[#00965E]">{step.detail}</p>
                </div>
              </motion.div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <>
                  {/* Desktop arrow */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
                    className="hidden shrink-0 items-center justify-center px-4 md:flex"
                  >
                    <ArrowRight size={24} className="text-[#00C47A]/40" strokeWidth={1.5} />
                  </motion.div>

                  {/* Mobile chevron */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
                    className="my-3 flex md:hidden"
                  >
                    <ChevronDown size={24} className="text-[#00C47A]/40" strokeWidth={1.5} />
                  </motion.div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 text-center"
        >
          <p className="mb-5 text-[#4B5563]">¿Listo para empezar?</p>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 rounded-full bg-[#00C47A] px-7 py-3.5 text-sm font-semibold text-[#0D1117] shadow-[0_0_20px_rgba(0,196,122,0.25)] transition-all duration-200 hover:bg-[#4DDBA0] hover:shadow-[0_0_32px_rgba(0,196,122,0.4)] active:scale-95"
          >
            Únete a la lista de espera
            <ArrowRight size={15} strokeWidth={2} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
