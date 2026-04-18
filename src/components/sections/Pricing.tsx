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
    name: "Free",
    segment: "Prueba",
    price: "$0/mes",
    priceAnchor: null,
    description: "Para explorar Armio sin riesgo y validar el encaje",
    features: [
      { text: "1 usuario" },
      { text: "5 propiedades activas" },
      { text: "Leads y clientes" },
      { text: "Contratos digitales" },
      { text: "Soporte por comunidad" },
    ] as PlanFeature[],
    popular: false,
    earlyAccess: false,
    cta: "Reservar mi lugar gratis",
    ctaHref: "#cta",
  },
  {
    name: "Starter",
    segment: "Ideal para independientes",
    price: "$89.000/mes",
    originalPrice: "$179.000/mes",
    priceAnchor: "Menos de $3.000 al día para operar con orden",
    description: "La entrada clara para independientes y microequipos",
    features: [
      { text: "1 usuario principal + apoyo" },
      { text: "50 propiedades activas" },
      { text: "Leads, clientes y Mi día" },
      { text: "Contratos digitales" },
      { text: "Soporte por email" },
    ] as PlanFeature[],
    popular: true,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#cta",
  },
  {
    name: "Pro",
    segment: "Agencia en crecimiento",
    price: "$219.000/mes",
    originalPrice: "$439.000/mes",
    priceAnchor: "Cuando ya necesitas operar y coordinar equipo",
    description: "Para agencias que ya necesitan más capacidad y más control",
    features: [
      { text: "10 usuarios" },
      { text: "200 propiedades activas" },
      { text: "CRM y operación ampliada" },
      { text: "Contratos + documentos" },
      { text: "Soporte email prioritario" },
    ] as PlanFeature[],
    popular: false,
    earlyAccess: true,
    cta: "Únete a la lista de espera",
    ctaHref: "#cta",
  },
  {
    name: "Agencia",
    segment: "Operación consolidada",
    price: "$399.000/mes",
    originalPrice: "$799.000/mes",
    priceAnchor: "Capacidad total para operar sin topes",
    description: "Para equipos que necesitan escala, soporte y margen operativo",
    features: [
      { text: "Usuarios ilimitados" },
      { text: "Propiedades ilimitadas" },
      { text: "CRM y operación ampliada" },
      { text: "Contratos + documentos" },
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
    <section id="pricing" className="bg-[#0D1117] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
            Precios
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-[#F0F6FC] md:text-4xl">
            Precios claros para operar solo y crecer con equipo
          </h2>
          <p className="mb-6 text-base text-balance text-[#8B949E]">
            Empieza simple, mantén precio en pesos colombianos y escala sin cambiar de sistema
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-[#00C47A]/30 bg-[#00C47A]/8 px-5 py-2.5">
            <Countdown
              spots={EARLY_ACCESS_TOTAL_SPOTS}
              spotsTaken={EARLY_ACCESS_CLAIMED_SPOTS}
              variant="dark"
            />
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: plan.popular ? -8 : -4 }}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-[#00C47A] bg-[#161B22] shadow-[0_0_0_1px_rgba(0,196,122,0.3),0_0_40px_rgba(0,196,122,0.12)] hover:shadow-[0_0_0_1px_rgba(0,196,122,0.5),0_0_60px_rgba(0,196,122,0.2)]"
                  : "border-[#21262D] bg-[#161B22] hover:border-[#00C47A]/25 hover:shadow-[0_0_0_1px_rgba(0,196,122,0.15),0_8px_32px_rgba(0,0,0,0.4)]"
              }`}
            >
              {/* Top accent glow line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[#00C47A]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-[#00C47A] px-3 py-1 text-xs font-medium text-[#0D1117] shadow-sm">
                    Recomendado
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#F0F6FC]">{plan.name}</h3>
                {plan.earlyAccess && <Badge variant="warning">⭐ Fundador</Badge>}
              </div>
              <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-[#00C47A] uppercase">
                {plan.segment}
              </p>
              <p className="mb-4 text-xs text-[#8B949E]">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                {SHOW_PRICES ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-[#F0F6FC]">{plan.price}</span>
                      {plan.earlyAccess && plan.originalPrice && (
                        <span className="text-sm text-[#484F58] line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    {plan.priceAnchor && (
                      <p className="mt-1 text-[11px] font-medium text-[#00C47A]">
                        {plan.priceAnchor}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-semibold text-[#F0F6FC]">
                      {plan.name === "Free" ? "Gratis" : "Early Access"}
                    </span>
                    <p className="mt-1 text-[11px] leading-snug text-[#8B949E]">
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
                          ? "text-[#00C47A]"
                          : plan.earlyAccess
                            ? "text-[#4DDBA0]"
                            : "text-[#484F58]"
                      }`}
                    />
                    <span className="flex flex-wrap items-center gap-1.5 text-sm text-[#8B949E]">
                      {feature.text}
                      {feature.comingSoon && (
                        <span className="inline-flex items-center rounded-full border border-[#00C47A]/20 bg-[#00C47A]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00C47A]">
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
                    ? "border-[#00C47A] bg-[#00C47A] font-bold text-[#0D1117] hover:border-[#4DDBA0] hover:bg-[#4DDBA0]"
                    : plan.earlyAccess
                      ? "border border-[#00C47A]/40 bg-transparent text-[#00C47A] hover:border-[#00C47A] hover:bg-[#00C47A]/10"
                      : "border border-[#21262D] bg-transparent text-[#8B949E] hover:border-[#8B949E] hover:text-[#F0F6FC]"
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
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center text-sm font-medium text-[#4DDBA0]"
        >
          Empieza solo en Starter y sube a Pro o Agencia cuando armes equipo.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-xs text-[#484F58]"
        >
          El precio fundador de early access mantiene el 50% OFF mientras tu suscripción siga
          activa. No hay cobro al registrarte.
        </motion.p>
      </div>
    </section>
  );
}
