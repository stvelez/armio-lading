import { Mail, ArrowRight } from "lucide-react";

export default function ComingSoon() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#2C2C2A] px-6">
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(29,158,117,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        {/* Wordmark */}
        <span
          className="text-5xl font-semibold tracking-[-0.02em] text-white mb-6 select-none"
          style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
        >
          armio
        </span>

        {/* Divider accent */}
        <div className="w-8 h-0.5 bg-[#1D9E75] mb-8 rounded-full" />

        {/* Headline */}
        <h1 className="text-2xl font-semibold text-white leading-snug tracking-[-0.01em] mb-4">
          Estamos construyendo algo grande.
        </h1>

        {/* Subtext */}
        <p className="text-[#B4B2A9] text-base font-normal leading-relaxed mb-10 max-w-sm">
          El sistema operativo de tu agencia inmobiliaria. Propiedades, leads y
          contratos — todo en un solo lugar. Muy pronto.
        </p>

        {/* CTA */}
        <a
          href="mailto:hola@armio.co"
          className="group inline-flex items-center gap-2.5 bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-sm font-medium px-5 py-3 rounded-md transition-colors duration-150"
        >
          <Mail size={16} strokeWidth={1.5} />
          hola@armio.co
          <ArrowRight
            size={14}
            strokeWidth={1.5}
            className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
          />
        </a>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-[#888780] text-xs font-normal">
        © {new Date().getFullYear()} Armio · armio.co
      </footer>
    </main>
  );
}
