"use client";

import { Check } from "lucide-react";
import Countdown from "@/components/ui/Countdown";
import Badge from "@/components/ui/Badge";

const SHOW_PRICES = process.env.NEXT_PUBLIC_SHOW_PRICES === "true";

const plans = [
  {
    name: "Free",
    price: "$0/mes",
    description: "Para empezar a explorar",
    features: [
      "1 agente",
      "5 propiedades activas",
      "CRM de leads básico",
      "Contratos digitales",
      "Soporte por comunidad",
    ],
    popular: false,
    earlyAccess: false,
    cta: "Empezar gratis",
    ctaHref: "#waitlist",
  },
  {
    name: "Starter",
    price: "$89.000/mes",
    originalPrice: "$179.000/mes",
    description: "Para agencias pequeñas en crecimiento",
    features: [
      "5 agentes",
      "50 propiedades activas",
      "CRM de leads básico",
      "Contratos digitales",
      "Soporte por email",
    ],
    popular: false,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#waitlist",
  },
  {
    name: "Pro",
    price: "$219.000/mes",
    originalPrice: "$439.000/mes",
    description: "El plan del cliente ideal",
    features: [
      "10 agentes",
      "200 propiedades activas",
      "CRM avanzado",
      "Contratos + plantillas",
      "Soporte email prioritario",
    ],
    popular: true,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#waitlist",
  },
  {
    name: "Agencia",
    price: "$399.000/mes",
    originalPrice: "$799.000/mes",
    description: "Para agencias grandes sin límites",
    features: [
      "Agentes ilimitados",
      "Propiedades ilimitadas",
      "CRM avanzado",
      "Contratos + plantillas",
      "WhatsApp nativo",
      "Soporte prioritario",
    ],
    popular: false,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#waitlist",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-[#0F6E56] uppercase">Precios</p>
          <h2 className="mb-4 text-3xl font-semibold text-[#2C2C2A] md:text-4xl">
            Transparente para agencias en crecimiento
          </h2>
          <p className="mb-6 text-lg text-[#5F5E5A]">Planes en pesos colombianos, sin sorpresas</p>
          <div className="inline-flex items-center gap-3 rounded-full bg-[#0F6E56] px-5 py-2.5">
            <Countdown spots={100} spotsTaken={23} />
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ${
                plan.popular ? "border-2 border-[#1D9E75] shadow-lg" : "border-[#D3D1C7] bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-[#0F6E56] px-3 py-1 text-xs font-medium text-white">
                    Más popular
                  </span>
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2C2C2A]">{plan.name}</h3>
                {plan.earlyAccess && <Badge variant="warning">🔥 50% OFF</Badge>}
              </div>
              <p className="mb-4 text-xs text-[#5F5E5A]">{plan.description}</p>

              <div className="mb-6">
                {SHOW_PRICES ? (
                  <div>
                    <span className="text-3xl font-semibold text-[#2C2C2A]">{plan.price}</span>
                    {plan.earlyAccess && plan.originalPrice && (
                      <span className="ml-2 text-sm text-[#B4B2A9] line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-base font-medium text-[#5F5E5A]">Próximamente</span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.popular ? "text-[#1D9E75]" : "text-[#B4B2A9]"
                      }`}
                    />
                    <span className="text-sm text-[#5F5E5A]">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`w-full rounded-md border px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                  plan.popular
                    ? "border-[#0F6E56] bg-[#0F6E56] text-white hover:bg-[#0a5242]"
                    : "border-[#D3D1C7] bg-[#F1EFE8] text-[#5F5E5A] hover:bg-[#E8E6DE]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
