'use client';

import { Check, Zap } from 'lucide-react';
import NewsletterForm from '@/components/forms/NewsletterForm';
import Countdown from '@/components/ui/Countdown';

const plans = [
  {
    name: 'Starter',
    price: 'Gratis',
    badge: 'Coming Soon',
    badgeStyle: 'bg-[#F1EFE8] text-[#888780]',
    features: [
      'Hasta 10 usuarios',
      '100 propiedades',
      'CRM de leads básico',
      'Contratos digitales',
      'Soporte por email',
    ],
    popular: false,
    disabled: true,
  },
  {
    name: 'Professional',
    price: '$49/mes',
    earlyPrice: '$24/mes',
    badge: '🔥 50% OFF — Early Access',
    badgeStyle: 'bg-[#1D9E75] text-white',
    features: [
      'Usuarios ilimitados',
      'Propiedades ilimitadas',
      'CRM avanzado + automations',
      'Contratos + plantillas',
      'API access',
      'Soporte prioritario',
    ],
    popular: true,
    disabled: false,
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
          <p className="text-[#5F5E5A] text-lg mb-6">
            Solo 100 cupos de Early Access disponibles
          </p>
          <div className="flex justify-center">
            <Countdown spots={100} spotsTaken={0} />
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 border transition-all duration-200 ${
                plan.popular
                  ? 'border-[#1D9E75] border-2 shadow-lg'
                  : 'border-[#D3D1C7] bg-white'
              } ${plan.disabled ? 'opacity-60' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${plan.badgeStyle}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-semibold text-[#2C2C2A] mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-6">
                {plan.popular ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold text-[#1D9E75]">{plan.earlyPrice}</span>
                      <span className="text-[#B4B2A9] line-through text-lg">{plan.price}</span>
                    </div>
                    <p className="text-[#5F5E5A] text-sm mt-1">de por vida · Early Access</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-semibold text-[#2C2C2A]">{plan.price}</span>
                    <p className="text-[#888780] text-sm mt-1">Próximamente disponible</p>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      size={18}
                      strokeWidth={2}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-[#1D9E75]' : 'text-[#B4B2A9]'
                      }`}
                    />
                    <span className="text-[#5F5E5A] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.popular ? (
                <div>
                  <NewsletterForm
                    location="pricing"
                    placeholder="tu@email.com"
                    buttonText="Únete a la lista de espera"
                    className="flex gap-2"
                  />
                  <p className="text-xs text-[#888780] mt-3 text-center">
                    Código de 50% OFF aplicado automáticamente al lanzar
                  </p>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full bg-[#F1EFE8] text-[#888780] px-6 py-3 rounded-md text-sm font-medium border border-[#D3D1C7] disabled:cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Fine Print */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <div className="bg-[#F1EFE8] rounded-xl p-6 border border-[#D3D1C7]">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap size={16} className="text-[#1D9E75]" strokeWidth={1.5} />
              <span className="text-[#2C2C2A] font-medium text-sm">Beneficios del Early Access</span>
            </div>
            <ul className="space-y-1.5 text-[#5F5E5A] text-sm">
              <li>• Sin tarjeta de crédito requerido</li>
              <li>• Early access cuando lancemos oficialmente</li>
              <li>• Descuento de por vida (mientras mantengas la suscripción)</li>
              <li>• Soporte prioritario para early adopters</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
