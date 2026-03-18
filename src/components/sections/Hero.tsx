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
      className="relative flex min-h-screen items-center overflow-hidden bg-[#2C2C2A] px-6"
    >
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 50%, rgba(29,158,117,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20">
        {/* Left: Copy */}
        <div>
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-5 text-2xl leading-snug font-semibold tracking-[-0.01em] text-white md:text-3xl"
          >
            El sistema operativo de tu <span className="text-[#1D9E75]">agencia inmobiliaria</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8 max-w-lg text-base leading-relaxed font-normal text-[#B4B2A9] md:text-lg"
          >
            Centraliza propiedades, leads y contratos en un solo lugar. Deja atrás el Excel y el
            WhatsApp para siempre.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-6"
          >
            <Countdown spots={100} spotsTaken={0} />
          </motion.div>

          {/* Newsletter Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-8"
          >
            <NewsletterForm
              location="hero"
              placeholder="Tu email profesional"
              buttonText="Únete a la lista de espera ▶"
              className="flex gap-2"
            />
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#888780]"
          >
            {["Sin tarjeta de crédito", "14 días de prueba", "Cancela cuando quieras"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1D9E75]" strokeWidth={1.5} />
                  <span>{item}</span>
                </div>
              )
            )}
          </motion.div>

          {/* Early Access Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5"
          >
            <span className="text-sm font-semibold text-amber-300">
              🔥 Early Access — 50% OFF de por vida para los primeros 100
            </span>
          </motion.div>
        </div>

        {/* Right: Product Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:block"
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}
