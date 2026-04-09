"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Play, ArrowRight } from "lucide-react";
import HeroMockup from "@/components/sections/HeroMockup";
import Countdown from "@/components/ui/Countdown";
import { EARLY_ACCESS_CLAIMED_SPOTS, EARLY_ACCESS_TOTAL_SPOTS } from "@/lib/early-access";

const SOCIAL_PROOF_AVATARS = [
  { initials: "CM", bg: "#1D9E75", text: "#fff" },
  { initials: "LP", bg: "#5DCAA5", text: "#fff" },
  { initials: "AR", bg: "#0F6E56", text: "#fff" },
  { initials: "JT", bg: "#E1F5EE", text: "#0F6E56" },
];

export default function Hero() {
  return (
    <section
      id="waitlist"
      className="relative flex min-h-screen items-start overflow-hidden bg-[#F1EFE8] px-6 pt-24 pb-0"
    >
      {/* Mesh gradient background — 3 blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 50% 40% at 85% 15%, rgba(29,158,117,0.13) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 35% at 10% 85%, rgba(29,158,117,0.07) 0%, transparent 55%)",
            "radial-gradient(ellipse 60% 30% at 50% -5%, rgba(93,202,165,0.09) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Copy block — centrado */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D3D1C7] bg-white px-3.5 py-1.5 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1D9E75] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1D9E75]" />
            </span>
            <span className="text-xs font-medium text-[#5F5E5A]">
              Early access abierto — cupos limitados
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="mb-5 max-w-3xl text-5xl leading-[1.1] font-semibold tracking-[-0.03em] text-[#2C2C2A] md:text-6xl lg:text-[72px]"
          >
            El sistema operativo de tu{" "}
            <span className="text-[#1D9E75] italic">agencia inmobiliaria</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mb-8 max-w-md text-lg leading-[1.5] text-balance text-[#5F5E5A]"
          >
            Gestiona propiedades, leads y contratos desde un solo lugar. Diseñado para agencias
            colombianas que quieren dejar atrás el Excel.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mb-6 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(29,158,117,0.35)] focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
                boxShadow: "0 4px 14px rgba(29,158,117,0.25)",
              }}
            >
              Unirme a la lista
              <ArrowRight size={15} strokeWidth={2} />
            </a>
            <a
              href="#producto"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D3D1C7] bg-white px-7 py-3.5 text-sm font-medium text-[#5F5E5A] transition-all duration-200 hover:scale-[1.03] hover:border-[#1D9E75] hover:text-[#1D9E75] focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
            >
              <Play size={13} strokeWidth={2} className="fill-current" />
              Explorar producto
            </a>
          </motion.div>

          {/* Social proof + scarcity — 1 sola línea */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.48 }}
            className="mb-6 flex flex-wrap items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {SOCIAL_PROOF_AVATARS.map((a) => (
                <div
                  key={a.initials}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#F1EFE8] text-[10px] font-medium"
                  style={{ backgroundColor: a.bg, color: a.text }}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#5F5E5A]">
              <span className="font-semibold text-[#2C2C2A]">
                {EARLY_ACCESS_CLAIMED_SPOTS} agencias
              </span>{" "}
              ya reservaron acceso
            </p>
            <span className="text-[#D3D1C7]">·</span>
            <Countdown
              spots={EARLY_ACCESS_TOTAL_SPOTS}
              spotsTaken={EARLY_ACCESS_CLAIMED_SPOTS}
              variant="light"
            />
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.56 }}
            className="mb-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#888780]"
          >
            {[
              "No necesitas tarjeta para registrarte",
              "Acceso anticipado cuando abramos onboarding",
              "50% OFF de por vida con precio fundador",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#1D9E75]" strokeWidth={2} />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Product Mockup — full width, perspective 3D */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-4xl"
          style={{ perspective: "1200px" }}
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}
