"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import Countdown from "@/components/ui/Countdown";
import { EARLY_ACCESS_CLAIMED_SPOTS, EARLY_ACCESS_TOTAL_SPOTS } from "@/lib/early-access";

const benefits = ["50% OFF de por vida", "Acceso anticipado", "Sin tarjeta ni cobro hoy"];

export default function CTA() {
  const [fixedCTADismissed, setFixedCTADismissed] = useState(false);

  return (
    <>
      <section id="cta" className="bg-[#1D9E75] px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <p className="mb-4 text-sm font-medium tracking-wide text-[#E1F5EE] uppercase">
            Early Access
          </p>

          {/* Headline */}
          <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
            Asegura tu acceso preferencial a Armio
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mb-7 max-w-xl text-lg leading-relaxed text-[#E1F5EE]">
            Deja tu correo y reserva precio fundador para gestionar tu agencia con Armio.
          </p>

          {/* Benefits List */}
          <div className="mx-auto mb-7 flex max-w-3xl flex-wrap justify-center gap-3 text-left">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="flex-shrink-0 text-white" strokeWidth={2} />
                  <span className="text-sm whitespace-nowrap text-[#E1F5EE]">{benefit}</span>
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
          <p className="mb-5 text-sm text-white/80">
            Te escribiremos cuando abramos acceso. Sin spam.
          </p>

          <div className="flex justify-center">
            <div className="rounded-full border border-white/30 bg-white/15 px-4 py-2">
              <Countdown spots={EARLY_ACCESS_TOTAL_SPOTS} spotsTaken={EARLY_ACCESS_CLAIMED_SPOTS} />
            </div>
          </div>

          <p className="mt-3 text-xs text-white/70">
            Early access limitado a {EARLY_ACCESS_TOTAL_SPOTS} agencias.
          </p>
        </div>
      </section>

      {/* Fixed bottom CTA — mobile only (PWA-style) */}
      {!fixedCTADismissed && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#3C3C3A] bg-[#1D1D1B] px-4 py-3 shadow-xl sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                Reserva tu acceso preferencial
              </p>
              <p className="text-xs text-[#B4B2A9]">Sin tarjeta y sin cobro hoy</p>
            </div>
            <a
              href="#cta"
              className="shrink-0 rounded-md bg-[#0F6E56] px-4 py-2 text-xs font-semibold whitespace-nowrap text-white"
              onClick={() => setFixedCTADismissed(true)}
            >
              Ver formulario
            </a>
            <button
              onClick={() => setFixedCTADismissed(true)}
              className="shrink-0 text-lg leading-none text-[#888780]"
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
