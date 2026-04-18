"use client";

import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import HeroMockup from "@/components/sections/HeroMockup";
import Countdown from "@/components/ui/Countdown";
import { EARLY_ACCESS_CLAIMED_SPOTS, EARLY_ACCESS_TOTAL_SPOTS } from "@/lib/early-access";

const SOCIAL_PROOF_AVATARS = [
  { initials: "CM", bg: "#00C47A", text: "#0D1117" },
  { initials: "LP", bg: "#4DDBA0", text: "#0D1117" },
  { initials: "AR", bg: "#00965E", text: "#F0F6FC" },
  { initials: "JT", bg: "#161B22", text: "#00C47A" },
];

export default function Hero() {
  return (
    <section
      id="waitlist"
      className="relative flex min-h-screen items-start overflow-hidden bg-[#0D1117] px-6 pt-24 pb-0 md:min-h-[calc(100svh-12px)]"
    >
      {/* Radial green glow — top center */}
      <div aria-hidden="true" className="glow-green-radial pointer-events-none absolute inset-0" />

      {/* Fine grid overlay */}
      <div aria-hidden="true" className="hero-grid-overlay pointer-events-none absolute inset-0" />

      {/* Bottom fade to dark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-48"
        style={{ background: "linear-gradient(to bottom, transparent, #0D1117)" }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col">
        {/* Copy block — centrado */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#21262D] bg-[#161B22] px-3.5 py-1.5 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C47A] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C47A]" />
            </span>
            <span className="text-xs font-medium text-[#8B949E]">
              Early access abierto — cupos limitados
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="mb-4 max-w-[12ch] font-bold tracking-[-0.05em] text-[#F0F6FC]"
            style={{
              fontFamily: "var(--font-display), serif",
              fontSize: "clamp(52px, 8vw, 112px)",
              lineHeight: "0.95",
            }}
          >
            Ordena tu{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg, #00C47A 0%, #4DDBA0 60%, #00E5FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              operación
            </span>
            <br />
            inmobiliaria
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mb-7 max-w-lg text-base leading-[1.6] text-balance text-[#8B949E] md:text-lg"
          >
            Propiedades, leads y contratos en un solo lugar para trabajar con orden, si vas solo o
            con equipo.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mb-5 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-[#0D1117] transition-all duration-200 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#00C47A] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #00C47A 0%, #00965E 100%)",
                boxShadow: "0 4px 20px rgba(0,196,122,0.35)",
                animation: "glow-pulse 3s ease-in-out infinite",
              }}
            >
              Reservar acceso
              <ArrowRight size={15} strokeWidth={2} />
            </a>
            <a
              href="#producto"
              className="inline-flex items-center gap-2 rounded-xl border border-[#21262D] bg-[#161B22] px-7 py-3.5 text-sm font-medium text-[#8B949E] transition-all duration-200 hover:scale-[1.03] hover:border-[#00C47A]/40 hover:text-[#00C47A] focus-visible:ring-2 focus-visible:ring-[#00C47A] focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
            >
              <Play size={13} strokeWidth={2} className="fill-current" />
              Explorar producto
            </a>
          </motion.div>

          {/* Social proof + scarcity — comprimido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.48 }}
            className="mb-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs"
          >
            <div className="flex -space-x-2">
              {SOCIAL_PROOF_AVATARS.map((a) => (
                <div
                  key={a.initials}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0D1117] text-[10px] font-medium"
                  style={{ backgroundColor: a.bg, color: a.text }}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <p className="text-[#8B949E]">
              <span className="font-semibold text-[#F0F6FC]">
                {EARLY_ACCESS_CLAIMED_SPOTS} equipos
              </span>{" "}
              ya reservaron acceso
            </p>
            <span className="hidden text-[#484F58] md:inline">·</span>
            <Countdown
              spots={EARLY_ACCESS_TOTAL_SPOTS}
              spotsTaken={EARLY_ACCESS_CLAIMED_SPOTS}
              variant="light"
            />
          </motion.div>
        </div>

        {/* Product Mockup — full width, perspective 3D */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-4xl md:mt-auto"
          style={{ perspective: "1200px" }}
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}
