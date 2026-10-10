"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { REGISTER_URL } from "@/lib/app-links";

const benefits = ["3 meses gratis", "Sin tarjeta", "Pagas solo si decides continuar"];

export default function CTA() {
  const [fixedCTADismissed, setFixedCTADismissed] = useState(false);

  return (
    <>
      <section id="cta" className="relative overflow-hidden bg-[#0D1117] px-6 py-24">
        {/* Central green glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(0,196,122,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
            Empieza hoy
          </p>

          {/* Headline */}
          <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
            Prueba Armio 3 meses gratis
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mb-7 max-w-xl text-lg leading-relaxed text-[#8B949E]">
            Crea tu cuenta en minutos, elige el plan que necesitas y ordena tu operación
            inmobiliaria, si trabajas solo o con equipo.
          </p>

          {/* Benefits List */}
          <div className="mx-auto mb-7 flex max-w-3xl flex-wrap justify-center gap-3 text-left">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-full border border-[#21262D] bg-[#161B22] px-4 py-2.5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 text-[#00C47A]"
                    strokeWidth={2}
                  />
                  <span className="text-sm whitespace-nowrap text-[#F0F6FC]">{benefit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mb-4 max-w-lg">
            <a
              href={REGISTER_URL}
              onClick={() => trackCTAClick("cta")}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#00C47A] px-7 py-4 text-base font-semibold text-[#0D1117] shadow-[0_0_24px_rgba(0,196,122,0.35)] transition-all duration-200 hover:bg-[#4DDBA0] active:scale-[0.98]"
            >
              Crear mi cuenta gratis
            </a>
          </div>

          <p className="mb-5 text-sm text-[#484F58]">
            Sin tarjeta. Si no eliges un plan al terminar, pasas al plan Free y conservas tus datos.
          </p>
        </div>
      </section>

      {/* Fixed bottom CTA — mobile only (PWA-style) */}
      {!fixedCTADismissed && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#21262D] bg-[#0D1117] px-4 py-3 shadow-xl sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">Prueba Armio 3 meses gratis</p>
              <p className="text-xs text-[#8B949E]">Sin tarjeta · Elige tu plan</p>
            </div>
            <a
              href={REGISTER_URL}
              onClick={() => {
                trackCTAClick("cta-mobile");
                setFixedCTADismissed(true);
              }}
              className="shrink-0 rounded-md bg-[#00C47A] px-4 py-2 text-xs font-semibold whitespace-nowrap text-[#0D1117]"
            >
              Empezar
            </a>
            <button
              onClick={() => setFixedCTADismissed(true)}
              className="shrink-0 text-lg leading-none text-[#484F58]"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
