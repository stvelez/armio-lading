"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Countdown from "@/components/ui/Countdown";
import Badge from "@/components/ui/Badge";
import { EARLY_ACCESS_CLAIMED_SPOTS, EARLY_ACCESS_TOTAL_SPOTS } from "@/lib/early-access";

const SHOW_PRICES = process.env.NEXT_PUBLIC_SHOW_PRICES === "true";

interface PlanFeature {
  text: string;
  comingSoon?: boolean;
}

const plans = [
  {
    name: "Emprendimiento",
    price: "$0/mes",
    priceAnchor: null,
    description: "Para empezar a explorar sin riesgos",
    features: [
      { text: "1 agente" },
      { text: "5 propiedades activas" },
      { text: "CRM de leads básico" },
      { text: "Contratos digitales" },
      { text: "Soporte por comunidad" },
    ] as PlanFeature[],
    popular: false,
    earlyAccess: false,
    cta: "Reservar mi lugar gratis",
    ctaHref: "#cta",
  },
  {
    name: "Agente",
    price: "$89.000/mes",
    originalPrice: "$179.000/mes",
    priceAnchor: "Menos de $3.000 al día",
    description: "Para agencias pequeñas en crecimiento",
    features: [
      { text: "5 agentes" },
      { text: "50 propiedades activas" },
      { text: "CRM de leads básico" },
      { text: "Contratos digitales" },
      { text: "Soporte por email" },
    ] as PlanFeature[],
    popular: false,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#cta",
  },
  {
    name: "Pro",
    price: "$219.000/mes",
    originalPrice: "$439.000/mes",
    priceAnchor: "Menos que 1 hora de trabajo de un agente",
    description: "El plan del cliente ideal",
    features: [
      { text: "10 agentes" },
      { text: "200 propiedades activas" },
      { text: "CRM avanzado" },
      { text: "Contratos + plantillas" },
      { text: "Soporte email prioritario" },
    ] as PlanFeature[],
    popular: true,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#cta",
  },
  {
    name: "Agencia",
    price: "$399.000/mes",
    originalPrice: "$799.000/mes",
    priceAnchor: "Todo por menos de $400.000 al mes",
    description: "Para agencias grandes sin límites",
    features: [
      { text: "Agentes ilimitados" },
      { text: "Propiedades ilimitadas" },
      { text: "CRM avanzado" },
      { text: "Contratos + plantillas" },
      { text: "WhatsApp nativo", comingSoon: true },
      { text: "Soporte prioritario" },
    ] as PlanFeature[],
    popular: false,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#cta",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#F1EFE8] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium tracking-widest text-[#0F6E56] uppercase">
            Precios
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-[#2C2C2A] md:text-4xl">
            Transparente para agencias en crecimiento
          </h2>
          <p className="mb-6 text-base text-balance text-[#5F5E5A]">
            Planes en pesos colombianos, con precio fundador para early access
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-[#1D9E75] bg-[#E1F5EE] px-5 py-2.5">
            <Countdown
              spots={EARLY_ACCESS_TOTAL_SPOTS}
              spotsTaken={EARLY_ACCESS_CLAIMED_SPOTS}
              variant="light"
            />
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: plan.popular ? -8 : -4 }}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-shadow duration-300 ${
                plan.popular
                  ? "border-2 border-[#1D9E75] bg-white shadow-lg hover:shadow-[0_16px_40px_rgba(29,158,117,0.15)]"
                  : "border-[#D3D1C7] bg-white hover:border-[#1D9E75]/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              }`}
            >
              {/* Top accent glow line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[#1D9E75]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-[#0F6E56] px-3 py-1 text-xs font-medium text-white shadow-sm">
                    Más popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2C2C2A]">{plan.name}</h3>
                {plan.earlyAccess && <Badge variant="warning">⭐ Fundador</Badge>}
              </div>
              <p className="mb-4 text-xs text-[#5F5E5A]">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                {SHOW_PRICES ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-[#2C2C2A]">{plan.price}</span>
                      {plan.earlyAccess && plan.originalPrice && (
                        <span className="text-sm text-[#B4B2A9] line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    {plan.priceAnchor && (
                      <p className="mt-1 text-[11px] font-medium text-[#1D9E75]">
                        {plan.priceAnchor}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-semibold text-[#2C2C2A]">
                      {plan.name === "Emprendimiento" ? "Gratis" : "Early Access"}
                    </span>
                    <p className="mt-1 text-[11px] leading-snug text-[#5F5E5A]">
                      {plan.priceAnchor
                        ? `${plan.priceAnchor} · Precio oficial después del lanzamiento`
                        : "Sin tarjeta y sin cobro hoy"}
                    </p>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.popular
                          ? "text-[#1D9E75]"
                          : plan.earlyAccess
                            ? "text-[#0F6E56]"
                            : "text-[#5F5E5A]"
                      }`}
                    />
                    <span className="flex flex-wrap items-center gap-1.5 text-sm text-[#5F5E5A]">
                      {feature.text}
                      {feature.comingSoon && (
                        <span className="inline-flex items-center rounded-full bg-[#E1F5EE] px-2 py-0.5 text-[10px] font-semibold text-[#0F6E56]">
                          Próximamente
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.ctaHref}
                className={`w-full rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  plan.popular
                    ? "border-[#0F6E56] bg-[#0F6E56] text-white hover:border-[#0a5242] hover:bg-[#0a5242]"
                    : plan.earlyAccess
                      ? "border-2 border-[#1D9E75] bg-transparent text-[#1D9E75] hover:border-[#0F6E56] hover:bg-[#0F6E56] hover:text-white"
                      : "border border-[#D3D1C7] bg-white text-[#5F5E5A] hover:border-[#1D9E75] hover:text-[#1D9E75]"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-xs text-[#888780]"
        >
          El precio fundador de early access mantiene el 50% OFF mientras tu suscripción siga
          activa. No hay cobro al registrarte.
        </motion.p>
      </div>
    </section>
  );
}
