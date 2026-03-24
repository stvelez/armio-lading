"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "¿Necesito conocimientos técnicos para usar Armio?",
    answer:
      "No, Armio está diseñado para ser intuitivo. Cualquier persona familiarizada con Excel o WhatsApp puede usarlo.",
  },
  {
    question: "¿Puedo importar mis propiedades desde Excel?",
    answer:
      "Sí, puedes importar propiedades desde Excel o crearlas desde cero con nuestro formulario intuitivo. Soportamos hasta 500 propiedades por lote.",
  },
  {
    question: "¿Hay un período de prueba gratuito?",
    answer:
      "Ofrecemos 30 días de prueba gratuita cuando lancemos oficialmente. Los primeros 100 early adopters obtendrán 50% OFF de por vida.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Sí, tus datos están encriptados y almacenados en servidores seguros. Cumplimos con todas las normativas de protección de datos en Colombia.",
  },
  {
    question: "¿Puedo cancelar mi suscripción?",
    answer:
      "Sí, puedes cancelar en cualquier momento sin penalidades. Con el Early Access, el descuento es de por vida mientras mantengas tu suscripción activa.",
  },
  {
    question: "¿Funciona en móvil?",
    answer:
      "Sí, Armio está optimizado para funcionar perfectamente en móviles y tablets. Puedes gestionar tu agencia desde cualquier dispositivo.",
  },
  {
    question: "¿Cómo funciona el descuento de 50% OFF?",
    answer:
      "Los primeros 100 en unirse a la lista de espera obtendrán 50% OFF de por vida en el plan Pro. Este descuento se aplica automáticamente cuando lance el producto.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
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

      <section id="faq" className="bg-[#F1EFE8] px-6 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-sm font-medium tracking-widest text-[#0F6E56] uppercase">
              Resolvemos tus dudas
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-[#2C2C2A] md:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="text-base text-balance text-[#5F5E5A]">
              Todo lo que necesitas saber sobre Armio
            </p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#D3D1C7] bg-white"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:bg-[#F1EFE8]"
                  aria-expanded={openIndex === index}
                >
                  <span className="pr-4 text-sm font-medium text-[#2C2C2A]">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-colors ${
                        openIndex === index ? "text-[#1D9E75]" : "text-[#B4B2A9]"
                      }`}
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-[#F1EFE8] px-6 pt-0 pb-5">
                        <p className="text-sm leading-relaxed text-[#5F5E5A]">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-[#5F5E5A]">¿Tienes más preguntas?</p>
            <a
              href="mailto:hola@armio.co"
              className="text-sm font-medium text-[#0F6E56] transition-colors hover:text-[#0a5242]"
            >
              Escríbenos a hola@armio.co →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
