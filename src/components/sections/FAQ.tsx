'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: '¿Necesito conocimientos técnicos para usar Armio?',
    answer: 'No, Armio está diseñado para ser intuitivo. Cualquier persona familiarizada con Excel o WhatsApp puede usarlo.',
  },
  {
    question: '¿Puedo importar mis propiedades desde Excel?',
    answer: 'Sí, puedes importar propiedades desde Excel o crearlas desde cero con nuestro formulario intuitivo. Soportamos hasta 500 propiedades por lote.',
  },
  {
    question: '¿Hay un período de prueba gratuito?',
    answer: 'Ofrecemos 14 días de prueba gratuita cuando lancemos oficialmente. Los primeros 100 early adopters obtendrán 50% OFF de por vida.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Sí, tus datos están encriptados y almacenados en servidores seguros. Cumplimos con todas las normativas de protección de datos en Colombia.',
  },
  {
    question: '¿Puedo cancelar mi suscripción?',
    answer: 'Sí, puedes cancelar en cualquier momento sin penalidades. Con el Early Access, el descuento es de por vida mientras mantengas tu suscripción activa.',
  },
  {
    question: '¿Funciona en móvil?',
    answer: 'Sí, Armio está optimizado para funcionar perfectamente en móviles y tablets. Puedes gestionar tu agencia desde cualquier dispositivo.',
  },
  {
    question: '¿Cómo funciona el descuento de 50% OFF?',
    answer: 'Los primeros 100 en unirse a la lista de espera obtendrán 50% OFF de por vida en el plan Professional. Este descuento se aplica automáticamente cuando lance el producto.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="py-24 px-6 bg-[#F1EFE8]">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <p className="text-[#1D9E75] text-sm font-medium mb-3 uppercase tracking-wide">
              Resolvemos tus dudas
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#2C2C2A] mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-[#5F5E5A] text-lg">
              Todo lo que necesitas saber sobre Armio
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#F1EFE8] transition-colors duration-150"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-[#2C2C2A] font-medium text-sm pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-colors ${
                        openIndex === index ? 'text-[#1D9E75]' : 'text-[#B4B2A9]'
                      }`}
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 pt-0 border-t border-[#F1EFE8]">
                        <p className="text-[#5F5E5A] text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-[#5F5E5A] mb-4">¿Tienes más preguntas?</p>
            <a
              href="mailto:hola@armio.co"
              className="text-[#1D9E75] hover:text-[#0F6E56] font-medium transition-colors text-sm"
            >
              Escríbenos a hola@armio.co →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
