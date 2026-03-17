'use client';

import { UserPlus, Upload, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: UserPlus,
    title: 'Crea tu cuenta',
    description: 'Regístrate en segundos, sin tarjeta de crédito',
    detail: 'Setup en menos de 2 minutos',
  },
  {
    icon: Upload,
    title: 'Importa tu cartera',
    description: 'Sube tus propiedades desde Excel o créalas desde cero',
    detail: 'Importa 100+ propiedades en minutos',
  },
  {
    icon: Target,
    title: 'Empieza a vender',
    description: 'Captura leads, gestiona contratos y cierra más ventas',
    detail: 'Primeras conversiones en menos de 24h',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-[#F1EFE8]">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="text-[#1D9E75] text-sm font-medium mb-3 uppercase tracking-wide">
            Simple de empezar
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2C2C2A] mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-[#5F5E5A] text-lg">
            En 3 simples pasos, transforma tu agencia
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center text-white font-semibold text-sm z-10">
                {index + 1}
              </div>

              {/* Step Card */}
              <div className="bg-white border border-[#D3D1C7] rounded-2xl p-8 pt-10 h-full">
                {/* Icon */}
                <div className="w-11 h-11 bg-[#E1F5EE] rounded-lg flex items-center justify-center mb-6">
                  <step.icon size={22} className="text-[#1D9E75]" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[#2C2C2A] mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[#5F5E5A] text-sm mb-4">{step.description}</p>

                {/* Detail */}
                <p className="text-[#1D9E75] text-sm font-medium">{step.detail}</p>
              </div>

              {/* Arrow connector (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                  <ArrowRight size={28} className="text-[#B4B2A9]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-[#5F5E5A] mb-6">¿Listo para empezar?</p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-6 py-3 rounded-md text-sm font-medium transition-colors duration-150"
          >
            Únete a la lista de espera
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
