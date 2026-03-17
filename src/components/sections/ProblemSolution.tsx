'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, FileSpreadsheet, FileText, Layers } from 'lucide-react';

export default function ProblemSolution() {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="text-[#1D9E75] text-sm font-medium mb-3 uppercase tracking-wide">
            El antes y el después
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2C2C2A] mb-4">
            ¿Te suena familiar?
          </h2>
          <p className="text-[#5F5E5A] text-lg">
            El caos de hoy vs el orden con Armio
          </p>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-3 bg-white hover:bg-[#F1EFE8] border border-[#D3D1C7] rounded-full px-6 py-3 transition-all duration-300 shadow-sm"
          >
            <span className={`text-sm font-medium ${showSolution ? 'text-[#888780]' : 'text-[#2C2C2A]'}`}>
              HOY
            </span>
            <div
              className={`w-10 h-6 rounded-full relative transition-all duration-300 ${
                showSolution ? 'bg-[#1D9E75]' : 'bg-[#E24B4A]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                  showSolution ? 'left-5' : 'left-1'
                }`}
              />
            </div>
            <span className={`text-sm font-medium ${showSolution ? 'text-[#2C2C2A]' : 'text-[#888780]'}`}>
              CON ARMIO
            </span>
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {showSolution ? (
            <motion.div
              key="solution"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-2xl p-8 md:p-12"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-video bg-white rounded-xl border border-[#D3D1C7] flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <CheckCircle size={40} className="text-[#1D9E75] mx-auto mb-3" />
                    <p className="text-[#2C2C2A] font-medium text-sm">Armio Dashboard</p>
                    <p className="text-[#888780] text-xs mt-1">Próximamente: screenshot real</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#1D9E75] mb-6">Con Armio</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Layers, text: 'Todo centralizado en un solo lugar' },
                      { icon: CheckCircle, text: 'Leads organizados y asignados a agentes' },
                      { icon: FileText, text: 'Contratos digitales automatizados' },
                      { icon: Layers, text: 'Dashboard con métricas en tiempo real' },
                      { icon: CheckCircle, text: 'Pipeline visual de cada propiedad' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <item.icon size={18} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
                        <span className="text-[#2C2C2A] text-sm">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="problem"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="bg-[#FCEBEB] border border-[#E24B4A]/20 rounded-2xl p-8 md:p-12"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-video bg-white rounded-xl border border-[#D3D1C7] flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <AlertCircle size={40} className="text-[#E24B4A] mx-auto mb-3" />
                    <p className="text-[#2C2C2A] font-medium text-sm">Excel + WhatsApp</p>
                    <p className="text-[#888780] text-xs mt-1">El caos de hoy</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#E24B4A] mb-6">Sin Armio</h3>
                  <div className="space-y-3">
                    {[
                      { icon: FileSpreadsheet, text: 'Propiedades dispersas en Excel y WhatsApp' },
                      { icon: AlertCircle, text: 'Leads perdidos en conversaciones personales' },
                      { icon: X, text: 'Contratos manuales y desorganizados' },
                      { icon: AlertCircle, text: 'Sin visibilidad del pipeline de ventas' },
                      { icon: Layers, text: '10+ tabs abiertos todo el tiempo' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <item.icon size={18} className="text-[#E24B4A] mt-0.5 flex-shrink-0" />
                        <span className="text-[#2C2C2A] text-sm">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
