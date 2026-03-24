"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  FileText,
  Contact,
  Play,
} from "lucide-react";
import DemoVideo from "@/components/ui/DemoVideo";

interface Tab {
  label: string;
  icon: React.ElementType;
  image: string;
}

const tabs: Tab[] = [
  { label: "Dashboard", icon: LayoutDashboard, image: "/screenshots/01-dashboard.jpg" },
  { label: "Propiedades", icon: Building2, image: "/screenshots/02-properties-list.jpg" },
  { label: "CRM · Leads", icon: Users, image: "/screenshots/07-crm-kanban.jpg" },
  { label: "Agentes", icon: UserCheck, image: "/screenshots/09-agents.jpg" },
  { label: "Contratos", icon: FileText, image: "/screenshots/12-contract-create.jpg" },
  { label: "Clientes", icon: Contact, image: "/screenshots/10-clients.jpg" },
];

export default function ProductPreview() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setActive((p) => (p + 1) % tabs.length), 4000);
    return () => clearInterval(id);
  }, [isPaused]);

  return (
    <section className="bg-[#1D9E75] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-sm font-medium tracking-widest text-[#E1F5EE] uppercase">
            Mira cómo funciona Armio
          </p>
          <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-white md:text-4xl">
            Todo tu negocio inmobiliario, <span className="text-[#E1F5EE]">en un solo lugar</span>
          </h2>
          <p className="text-lg text-[#E1F5EE]">
            Explora cada módulo del sistema y ve cómo trabajan juntos
          </p>
        </motion.div>

        {/* Tab switcher + progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col items-center gap-3"
        >
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex gap-1 rounded-full bg-[#0F6E56] p-1">
              {tabs.map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActive(i);
                      setIsPaused(true);
                    }}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-all duration-200 ${
                      active === i
                        ? "bg-white font-semibold text-[#0F6E56] shadow-sm"
                        : "text-[#E1F5EE] hover:bg-[#17845F]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-0.5 w-full max-w-2xl overflow-hidden rounded-full bg-[#0F6E56]">
            <motion.div
              key={active}
              className="h-full rounded-full bg-white/50"
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? "0%" : "100%" }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Browser chrome + screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="overflow-hidden rounded-2xl border border-[#D3D1C7] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-[#D3D1C7] bg-white px-3 py-0.5">
              <div className="h-2 w-2 rounded-full bg-[#1D9E75]" />
              <span className="text-[11px] text-[#888780]">app.armio.co</span>
            </div>
            <div className="w-16" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="relative aspect-[16/9] w-full bg-[#F1EFE8]"
            >
              <Image
                src={tabs[active].image}
                alt={tabs[active].label}
                fill
                className="object-cover object-top"
                priority={active === 0}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0F6E56] shadow-md transition-all duration-200 hover:bg-[#F1EFE8] active:scale-95"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E1F5EE] transition-colors group-hover:bg-[#D3D1C7]">
              <Play size={11} className="ml-0.5" />
            </span>
            Ver demo completa
          </button>
        </motion.div>
      </div>
      <DemoVideo isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
}
