import { Mail, ArrowRight } from "lucide-react";

export default function ComingSoon() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#2C2C2A] px-6">
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
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        {/* Wordmark */}
        <span
          className="mb-6 text-5xl font-semibold tracking-[-0.02em] text-white select-none"
          style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}
        >
          armio
        </span>

        {/* Divider accent */}
        <div className="mb-8 h-0.5 w-8 rounded-full bg-[#1D9E75]" />

        {/* Headline */}
        <h1 className="mb-4 text-2xl leading-snug font-semibold tracking-[-0.01em] text-white">
          Estamos construyendo algo grande.
        </h1>

        {/* Subtext */}
        <p className="mb-10 max-w-sm text-base leading-relaxed font-normal text-[#B4B2A9]">
          El sistema operativo de tu agencia inmobiliaria. Propiedades, leads y contratos — todo en
          un solo lugar. Muy pronto.
        </p>

        {/* CTA */}
        <a
          href="mailto:hola@armio.co"
          className="group inline-flex items-center gap-2.5 rounded-md bg-[#0F6E56] px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0a5242]"
        >
          <Mail size={16} strokeWidth={1.5} />
          hola@armio.co
          <ArrowRight
            size={14}
            strokeWidth={1.5}
            className="opacity-60 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </a>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-xs font-normal text-[#888780]">
        © {new Date().getFullYear()} Armio · armio.co
      </footer>
    </main>
  );
}
