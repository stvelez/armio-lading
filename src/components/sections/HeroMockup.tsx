"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingUp, FileCheck } from "lucide-react";

export default function HeroMockup() {
  return (
    <div className="relative w-full pb-6">
      {/* Main mockup with 3D tilt */}
      <motion.div
        aria-hidden="true"
        initial={{ rotateX: 6, rotateY: -2 }}
        whileHover={{ rotateX: 0, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="w-full overflow-hidden rounded-xl border border-[#21262D] bg-[#161B22] shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,196,122,0.08)]"
        style={{ transformOrigin: "center top", transformStyle: "preserve-3d" }}
      >
        {/* Browser bar */}
        <div className="flex items-center gap-3 border-b border-[#21262D] bg-[#0D1117] px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="mx-auto max-w-[200px] flex-1 rounded-md border border-[#21262D] bg-[#161B22] px-3 py-1 text-center text-[10px] font-medium text-[#8B949E]">
            app.armio.co/crm
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
          <Image
            src="/screenshots/07-crm-kanban.jpg"
            alt="CRM Armio — pipeline de leads por etapa"
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover object-top"
            priority
          />
        </div>
      </motion.div>

      {/* Floating card — top right: métricas */}
      <motion.div
        initial={{ opacity: 0, y: -16, x: 8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="absolute -top-3 right-4 z-10 hidden items-center gap-3 rounded-xl border border-[#21262D] bg-[#161B22]/90 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm md:right-8 md:flex"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#00C47A]/10">
          <TrendingUp size={16} className="text-[#00C47A]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#F0F6FC]">+12 leads</p>
          <p className="text-[11px] text-[#8B949E]">esta semana</p>
        </div>
      </motion.div>

      {/* Floating card — bottom left: contrato */}
      <motion.div
        initial={{ opacity: 0, y: 16, x: -8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, delay: 1.25 }}
        className="absolute -bottom-2 left-4 z-10 hidden items-center gap-3 rounded-xl border border-[#21262D] bg-[#161B22]/90 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm md:left-8 md:flex"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#00C47A]/10">
          <FileCheck size={16} className="text-[#00C47A]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#F0F6FC]">Contrato firmado</p>
          <p className="text-[11px] text-[#8B949E]">Hace 2 horas</p>
        </div>
      </motion.div>
    </div>
  );
}
