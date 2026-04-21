"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import Countdown from "@/components/ui/Countdown";
import { trackCTAClick } from "@/lib/analytics";
import { EARLY_ACCESS_CLAIMED_SPOTS, EARLY_ACCESS_TOTAL_SPOTS } from "@/lib/early-access";

const benefits = ["50% OFF de por vida", "Acceso anticipado", "Sin tarjeta ni cobro hoy"];

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
            Early Access
          </p>

          {/* Headline */}
          <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
            Asegura tu acceso preferencial a Armio
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mb-7 max-w-xl text-lg leading-relaxed text-[#8B949E]">
            Deja tu correo y reserva precio fundador para ordenar tu operación inmobiliaria, si
            trabajas solo o con equipo.
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

          {/* Newsletter Form — hidden on mobile (uses fixed bottom CTA instead) */}
          <div className="mx-auto mb-4 hidden max-w-lg sm:block">
            <NewsletterForm
              location="cta"
              placeholder="tu@email.com"
              buttonText="Reservar mi acceso"
              successTitle="Acceso preferencial reservado"
              successDescription="Te contactaremos cuando abramos el onboarding con tu precio fundador."
              className="flex gap-2"
            />
          </div>

          {/* Mobile inline form (above fixed bar) */}
          <div className="mx-auto mb-4 max-w-lg pb-20 sm:hidden">
            <NewsletterForm
              location="cta-mobile"
              placeholder="tu@email.com"
              buttonText="Reservar mi acceso"
              successTitle="Acceso preferencial reservado"
              successDescription="Te contactaremos cuando abramos el onboarding con tu precio fundador."
              className="flex flex-col gap-3"
            />
          </div>

          {/* Fine Print */}
          <p className="mb-5 text-sm text-[#484F58]">
            Te escribiremos cuando abramos acceso. Sin spam.
          </p>

          <div className="flex justify-center">
            <div className="rounded-full border border-[#21262D] bg-[#161B22] px-4 py-2">
              <Countdown spots={EARLY_ACCESS_TOTAL_SPOTS} spotsTaken={EARLY_ACCESS_CLAIMED_SPOTS} />
            </div>
          </div>

          <p className="mt-3 text-xs text-[#484F58]">
            Early access limitado a {EARLY_ACCESS_TOTAL_SPOTS} negocios inmobiliarios.
          </p>
        </div>
      </section>

      {/* Fixed bottom CTA — mobile only (PWA-style) */}
      {!fixedCTADismissed && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#21262D] bg-[#0D1117] px-4 py-3 shadow-xl sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                Reserva tu acceso preferencial
              </p>
              <p className="text-xs text-[#8B949E]">Empieza solo y escala después</p>
            </div>
            <a
              href="#cta"
              onClick={() => {
                trackCTAClick("cta-mobile");
                setFixedCTADismissed(true);
              }}
              className="shrink-0 rounded-md bg-[#00C47A] px-4 py-2 text-xs font-semibold whitespace-nowrap text-[#0D1117]"
            >
              Ver formulario
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
