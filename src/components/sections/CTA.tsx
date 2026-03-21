"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import Countdown from "@/components/ui/Countdown";

const benefits = [
  "Sin tarjeta de crédito requerido",
  "Early access cuando lancemos oficialmente",
  "Descuento de por vida (mientras mantengas la suscripción)",
  "Soporte prioritario para early adopters",
];

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
          <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">
            Sé de los primeros en transformar tu agencia
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#E1F5EE]">
            Únete a los primeros 100 early adopters y obtén{" "}
            <strong className="text-white">50% OFF de por vida</strong>. Cuando lancemos
            oficialmente, el precio cambiará.
          </p>

          {/* Countdown */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-full border border-white/30 bg-white/15 px-4 py-2">
              <Countdown spots={100} spotsTaken={23} />
            </div>
          </div>

          {/* Benefits List */}
          <div className="mx-auto mb-10 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 flex-shrink-0 text-white"
                  strokeWidth={2}
                />
                <span className="text-sm text-[#E1F5EE]">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Newsletter Form — hidden on mobile (uses fixed bottom CTA instead) */}
          <div className="mx-auto mb-6 hidden max-w-md sm:block">
            <NewsletterForm
              location="cta"
              placeholder="tu@email.com"
              buttonText="¡Quiero el 50% OFF!"
              className="flex gap-2"
            />
          </div>

          {/* Mobile inline form (above fixed bar) */}
          <div className="mx-auto mb-6 max-w-md pb-20 sm:hidden">
            <NewsletterForm
              location="cta-mobile"
              placeholder="tu@email.com"
              buttonText="¡Quiero el 50% OFF!"
              className="flex flex-col gap-3"
            />
          </div>

          {/* Fine Print */}
          <p className="text-xs text-white/80">
            Solo disponible para los primeros 100 registros · Sin compromiso de compra
          </p>
        </div>
      </section>

      {/* Fixed bottom CTA — mobile only (PWA-style) */}
      {!fixedCTADismissed && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#3C3C3A] bg-[#1D1D1B] px-4 py-3 shadow-xl sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                ¡Solo quedan cupos limitados!
              </p>
              <p className="text-xs text-[#B4B2A9]">50% OFF de por vida</p>
            </div>
            <a
              href="#waitlist"
              className="shrink-0 rounded-md bg-[#0F6E56] px-4 py-2 text-xs font-semibold whitespace-nowrap text-white"
              onClick={() => setFixedCTADismissed(true)}
            >
              ¡Quiero el 50% OFF!
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
