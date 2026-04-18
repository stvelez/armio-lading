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
    question: "¿Sirve si trabajo solo?",
    answer:
      "Sí. Armio está pensado para que puedas empezar como independiente, organizar propiedades, leads y contratos, y después crecer sin cambiar de sistema.",
  },
  {
    question: "¿Tengo que tener una agencia formal?",
    answer:
      "No. Puedes usar Armio como independiente o como equipo estructurado. Lo importante es que ya tengas una operación inmobiliaria que quieras ordenar.",
  },
  {
    question: "¿Puedo importar mis propiedades desde Excel?",
    answer:
      "Sí, puedes importar propiedades desde Excel o crearlas desde cero con nuestro formulario intuitivo. Soportamos hasta 500 propiedades por lote.",
  },
  {
    question: "¿Hay un período de prueba gratuito?",
    answer:
      "Cuando lancemos, tendrás onboarding anticipado y podrás activar tu cuenta con precio fundador. El registro al early access no tiene costo ni requiere tarjeta.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Sí, tus datos están encriptados y almacenados en servidores seguros. Cumplimos con todas las normativas de protección de datos en Colombia.",
  },
  {
    question: "¿Puedo cancelar mi suscripción?",
    answer:
      "Sí, puedes cancelar en cualquier momento sin penalidades. El precio fundador conserva el 50% OFF mientras mantengas tu suscripción activa.",
  },
  {
    question: "¿Funciona en móvil?",
    answer:
      "Sí, Armio está optimizado para funcionar perfectamente en móviles y tablets. Puedes gestionar tu operación desde cualquier dispositivo.",
  },
  {
    question: "¿Puedo empezar y luego sumar equipo?",
    answer:
      "Sí. La idea es que puedas empezar simple y subir de plan cuando necesites más capacidad, más usuarios o una operación más estructurada.",
  },
  {
    question: "¿Cómo funciona el descuento de 50% OFF?",
    answer:
      "Los primeros negocios inmobiliarios que reserven acceso obtienen precio fundador con 50% OFF de por vida sobre su plan al activarse Armio. Registrarte ahora solo reserva tu lugar; no se cobra nada hoy.",
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

      <section id="faq" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
              Resolvemos tus dudas
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-[#111827] md:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="text-base text-balance text-[#4B5563]">
              Todo lo que necesitas saber para empezar solo o con equipo
            </p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:bg-[#F9FAFB]"
                  aria-expanded={openIndex === index}
                >
                  <span className="pr-4 text-sm font-medium text-[#111827]">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-colors ${
                        openIndex === index ? "text-[#00C47A]" : "text-[#D1D5DB]"
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
                      <div className="border-t border-[#F3F4F6] px-6 pt-0 pb-5">
                        <p className="text-sm leading-relaxed text-[#4B5563]">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-[#4B5563]">¿Tienes más preguntas?</p>
            <a
              href="mailto:hola@armio.co"
              className="text-sm font-medium text-[#00C47A] transition-colors hover:text-[#00965E]"
            >
              Escríbenos a hola@armio.co →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
