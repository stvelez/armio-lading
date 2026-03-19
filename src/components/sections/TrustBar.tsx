"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, Target, Quote } from "lucide-react";

const metrics = [
  { icon: Users, value: "+100", label: "agencias en lista de espera" },
  { icon: Building2, value: "+5,000", label: "propiedades ya importadas" },
  { icon: Target, value: "+2,000", label: "leads capturados en beta" },
];

const testimonials = [
  {
    text: "Armio simplificó todo nuestro proceso en 2 días",
    author: "Carlos G.",
    city: "Medellín",
  },
  { text: "La mejor inversión que hemos hecho este año", author: "María R.", city: "Bogotá" },
  { text: "Ahora cerramos 30% más ventas", author: "Juan P.", city: "Cali" },
];

export default function TrustBar() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-y border-[#D3D1C7] bg-white px-6 py-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          {/* Metrics */}
          <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
            {metrics.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E1F5EE]">
                  <Icon size={16} className="text-[#1D9E75]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg leading-none font-bold text-[#2C2C2A]">{value}</p>
                  <p className="text-xs text-[#888780]">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden h-12 w-px bg-[#D3D1C7] lg:block" />

          {/* Rotating testimonial */}
          <div
            className="flex max-w-sm min-w-0 cursor-default items-start gap-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <Quote size={16} className="mt-0.5 flex-shrink-0 text-[#1D9E75]" />
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-sm leading-relaxed text-[#5F5E5A]">
                    &ldquo;{testimonials[current].text}&rdquo;
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#888780]">
                    — {testimonials[current].author}, {testimonials[current].city}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="mt-2 flex gap-0.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center"
                    aria-label={`Testimonio ${i + 1}`}
                  >
                    <span
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === current ? "w-4 bg-[#1D9E75]" : "w-1.5 bg-[#D3D1C7]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
