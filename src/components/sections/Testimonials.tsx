"use client";

import { Quote, TrendingUp } from "lucide-react";

const testimonials = [
  {
    quote:
      "Armio transformó cómo manejamos nuestra agencia. Pasamos de un caos absoluto a tener todo bajo control. La curva de aprendizaje fue increíblemente rápida.",
    author: "Juan Pérez",
    role: "Director",
    company: "Inmobiliaria Bogotá",
    stats: "30% más ventas en 2 meses",
  },
  {
    quote:
      "La curva de aprendizaje es increíble. En dos días todo el equipo ya usaba Armio sin problemas. Ahora ahorramos 10+ horas semanales en tareas manuales.",
    author: "María Rodríguez",
    role: "Agente Senior",
    company: "Propiedades Premium",
    stats: "20+ propiedades vendidas con Armio",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#F1EFE8] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-[#0F6E56] uppercase">
            Testimonios
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-[#2C2C2A] md:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-lg text-[#5F5E5A]">
            Agencias inmobiliarias que ya están transformando su negocio
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-2xl border border-[#D3D1C7] bg-white p-8 transition-colors duration-200 hover:border-[#1D9E75]"
            >
              {/* Decorative quote mark */}
              <Quote size={32} className="absolute top-6 right-6 text-[#1D9E75]/15" />

              {/* Quote */}
              <p className="mb-6 text-base leading-relaxed text-[#2C2C2A]">{testimonial.quote}</p>

              {/* Author Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-semibold text-[#0F6E56]">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2C2C2A]">{testimonial.author}</p>
                  <p className="text-sm text-[#5F5E5A]">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-5 border-t border-[#F1EFE8] pt-5">
                <div className="flex items-center gap-2 text-[#0F6E56]">
                  <TrendingUp size={15} strokeWidth={1.5} />
                  <span className="text-sm font-medium">{testimonial.stats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D3D1C7] bg-white px-6 py-3 shadow-sm">
            <span className="text-sm font-medium text-[#2C2C2A]">
              🏆 +100 agencias confían en Armio
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
