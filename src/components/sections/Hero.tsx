"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import Countdown from "@/components/ui/Countdown";
import HeroMockup from "@/components/sections/HeroMockup";

export default function Hero() {
  return (
    <section
      id="waitlist"
      className="relative flex min-h-screen items-center overflow-hidden bg-[#F1EFE8] px-6 pt-20"
    >
      {/* Decorative background — sutil, no agresivo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(29,158,117,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
        {/* Left: Copy */}
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D3D1C7] bg-white px-3.5 py-1.5 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
            <span className="text-xs font-medium text-[#5F5E5A]">Early access abierto</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-5 text-4xl leading-tight font-semibold tracking-[-0.02em] text-[#2C2C2A] md:text-5xl"
          >
            El sistema operativo de tu <span className="text-[#1D9E75]">agencia inmobiliaria</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-8 max-w-lg text-lg leading-relaxed text-[#5F5E5A]"
          >
            Gestiona propiedades, leads y contratos desde un solo lugar. Diseñado para agencias
            colombianas que quieren dejar atrás el Excel.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-5"
          >
            <Countdown spots={100} spotsTaken={0} />
          </motion.div>

          {/* Newsletter Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-6"
          >
            <NewsletterForm
              location="hero"
              placeholder="Tu email profesional"
              buttonText="Empezar gratis →"
              className="flex gap-2"
            />
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#888780]"
          >
            {["Sin tarjeta de crédito", "14 días de prueba gratis", "Cancela cuando quieras"].map(
              (item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#1D9E75]" strokeWidth={2} />
                  <span>{item}</span>
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* Right: Product Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:block"
        >
          {/* Sutil elevación del mockup */}
          <div className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
            <HeroMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
