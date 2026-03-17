'use client';

import { Check } from 'lucide-react';
import NewsletterForm from '@/components/forms/NewsletterForm';

const SHOW_PRICES = process.env.NEXT_PUBLIC_SHOW_PRICES === 'true';

const plans = [
  {
    name: 'Free',
    price: '$0/mes',
    description: 'Para empezar a explorar',
    features: [
      '1 agente',
      '5 propiedades activas',
      'CRM de leads básico',
      'Contratos digitales',
      'Soporte por comunidad',
    ],
    popular: false,
    cta: 'Empezar gratis',
    ctaHref: '#waitlist',
  },
  {
    name: 'Starter',
    price: '$89.000/mes',
    description: 'Para agencias pequeñas en crecimiento',
    features: [
      '5 agentes',
      '50 propiedades activas',
      'CRM de leads básico',
      'Contratos digitales',
      'Soporte por email',
    ],
    popular: false,
    cta: 'Únete a la lista de espera',
    ctaHref: '#waitlist',
  },
  {
    name: 'Pro',
    price: '$219.000/mes',
    description: 'El plan del cliente ideal',
    features: [
      '10 agentes',
      '200 propiedades activas',
      'CRM avanzado',
      'Contratos + plantillas',
      'Soporte email prioritario',
    ],
    popular: true,
    cta: 'Únete a la lista de espera',
    ctaHref: '#waitlist',
  },
  {
    name: 'Agencia',
    price: '$399.000/mes',
    description: 'Para agencias grandes sin límites',
    features: [
      'Agentes ilimitados',
      'Propiedades ilimitadas',
      'CRM avanzado',
      'Contratos + plantillas',
      'WhatsApp nativo',
      'Soporte prioritario',
    ],
    popular: false,
    cta: 'Únete a la lista de espera',
    ctaHref: '#waitlist',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="text-[#1D9E75] text-sm font-medium mb-3 uppercase tracking-wide">
            Precios
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2C2C2A] mb-4">
            Transparente para agencias en crecimiento
          </h2>
          <p className="text-[#5F5E5A] text-lg">
            Planes en pesos colombianos, sin sorpresas
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 border transition-all duration-200 flex flex-col ${
                plan.popular
                  ? 'border-[#1D9E75] border-2 shadow-lg'
                  : 'border-[#D3D1C7] bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#1D9E75] text-white">
                    Más popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-[#2C2C2A] mb-1">{plan.name}</h3>
              <p className="text-[#888780] text-xs mb-4">{plan.description}</p>

              <div className="mb-6">
                {SHOW_PRICES ? (
                  <span className="text-3xl font-semibold text-[#2C2C2A]">{plan.price}</span>
                ) : (
                  <span className="text-base font-medium text-[#888780]">Próximamente</span>
                )}
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-[#1D9E75]' : 'text-[#B4B2A9]'
                      }`}
                    />
                    <span className="text-[#5F5E5A] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === 'Free' ? (
                <a
                  href={plan.ctaHref}
                  className={`w-full text-center px-4 py-2.5 rounded-md text-sm font-medium border transition-colors ${
                    plan.popular
                      ? 'bg-[#1D9E75] text-white border-[#1D9E75] hover:bg-[#178a63]'
                      : 'bg-[#F1EFE8] text-[#5F5E5A] border-[#D3D1C7] hover:bg-[#E8E6DE]'
                  }`}
                >
                  {plan.cta}
                </a>
              ) : (
                <NewsletterForm
                  location="pricing"
                  placeholder="tu@email.com"
                  buttonText={plan.cta}
                  className="flex flex-col gap-2"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
