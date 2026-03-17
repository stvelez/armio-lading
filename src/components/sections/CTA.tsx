'use client';

import { CheckCircle2 } from 'lucide-react';
import NewsletterForm from '@/components/forms/NewsletterForm';
import Countdown from '@/components/ui/Countdown';

const benefits = [
  'Sin tarjeta de crédito requerido',
  'Early access cuando lancemos oficialmente',
  'Descuento de por vida (mientras mantengas la suscripción)',
  'Soporte prioritario para early adopters',
];

export default function CTA() {
  return (
    <section className="py-24 px-6 bg-[#1D9E75]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <p className="text-[#E1F5EE] text-sm font-medium mb-4 uppercase tracking-wide">
          Early Access
        </p>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
          Sé de los primeros en transformar tu agencia
        </h2>

        {/* Subheadline */}
        <p className="text-[#E1F5EE] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Únete a los primeros 100 early adopters y obtén{' '}
          <strong className="text-white">50% OFF de por vida</strong>.
          Cuando lancemos oficialmente, el precio cambiará.
        </p>

        {/* Countdown */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white/10 border border-white/20 rounded-full px-4 py-2">
            <Countdown spots={100} spotsTaken={0} />
          </div>
        </div>

        {/* Benefits List */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10 max-w-2xl mx-auto text-left">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="text-white mt-0.5 flex-shrink-0" strokeWidth={2} />
              <span className="text-[#E1F5EE] text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Newsletter Form */}
        <div className="max-w-md mx-auto mb-6">
          <NewsletterForm
            location="footer"
            placeholder="tu@email.com"
            buttonText="¡Quiero el 50% OFF!"
            className="flex gap-2"
          />
        </div>

        {/* Fine Print */}
        <p className="text-[#E1F5EE]/70 text-xs">
          Solo disponible para los primeros 100 registros · Sin compromiso de compra
        </p>
      </div>
    </section>
  );
}
