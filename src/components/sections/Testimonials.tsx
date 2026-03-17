'use client';

import { Quote, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    quote:
      'Armio transformó cómo manejamos nuestra agencia. Pasamos de un caos absoluto a tener todo bajo control. La curva de aprendizaje fue increíblemente rápida.',
    author: 'Juan Pérez',
    role: 'Director',
    company: 'Inmobiliaria Bogotá',
    stats: '30% más ventas en 2 meses',
  },
  {
    quote:
      'La curva de aprendizaje es increíble. En dos días todo el equipo ya usaba Armio sin problemas. Ahora ahorramos 10+ horas semanales en tareas manuales.',
    author: 'María Rodríguez',
    role: 'Agente Senior',
    company: 'Propiedades Premium',
    stats: '20+ propiedades vendidas con Armio',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-[#F1EFE8]">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="text-[#1D9E75] text-sm font-medium mb-3 uppercase tracking-wide">
            Testimonios
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2C2C2A] mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-[#5F5E5A] text-lg">
            Agencias inmobiliarias que ya están transformando su negocio
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white border border-[#D3D1C7] rounded-2xl p-8 relative hover:border-[#1D9E75] transition-colors duration-200"
            >
              {/* Decorative quote mark */}
              <Quote
                size={32}
                className="text-[#1D9E75]/15 absolute top-6 right-6"
              />

              {/* Quote */}
              <p className="text-[#2C2C2A] text-base leading-relaxed mb-6">
                {testimonial.quote}
              </p>

              {/* Author Info */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#E1F5EE] rounded-full flex items-center justify-center text-[#1D9E75] font-semibold text-sm flex-shrink-0">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[#2C2C2A] font-semibold text-sm">{testimonial.author}</h4>
                  <p className="text-[#888780] text-sm">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-5 pt-5 border-t border-[#F1EFE8]">
                <div className="flex items-center gap-2 text-[#1D9E75]">
                  <TrendingUp size={15} strokeWidth={1.5} />
                  <span className="text-sm font-medium">{testimonial.stats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white border border-[#D3D1C7] rounded-full px-6 py-3 shadow-sm">
            <span className="text-[#2C2C2A] text-sm font-medium">
              🏆 +100 agencias confían en Armio
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
