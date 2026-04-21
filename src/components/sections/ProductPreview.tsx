"use client";

import { useRef, useState, useEffect } from "react";
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
import { trackFeatureHover } from "@/lib/analytics";

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
  const trackedTabsRef = useRef(new Set<string>());

  const handleTabClick = (index: number, label: string) => {
    setActive(index);
    setIsPaused(true);

    if (trackedTabsRef.current.has(label)) {
      return;
    }

    trackedTabsRef.current.add(label);
    trackFeatureHover(label);
  };

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setActive((p) => (p + 1) % tabs.length), 4000);
    return () => clearInterval(id);
  }, [isPaused]);

  return (
    <section id="producto" className="bg-[#0D1117] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
            Mira cómo funciona Armio
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
            Todo tu negocio inmobiliario, <span className="text-[#4DDBA0]">en un solo lugar</span>
          </h2>
          <p className="text-lg text-[#8B949E]">
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
            <div className="inline-flex gap-1 rounded-full border border-[#21262D] bg-[#161B22] p-1">
              {tabs.map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.label}
                    onClick={() => handleTabClick(i, tab.label)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-all duration-200 ${
                      active === i
                        ? "bg-[#00C47A] font-semibold text-[#0D1117] shadow-sm"
                        : "text-[#8B949E] hover:bg-[#21262D] hover:text-[#F0F6FC]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-0.5 w-full max-w-2xl overflow-hidden rounded-full bg-[#21262D]">
            <motion.div
              key={active}
              className="h-full rounded-full bg-[#00C47A]/60"
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
          className="overflow-hidden rounded-2xl border border-[#21262D] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center justify-between border-b border-[#21262D] bg-[#161B22] px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-[#21262D] bg-[#0D1117] px-3 py-0.5">
              <div className="h-2 w-2 rounded-full bg-[#00C47A]" />
              <span className="text-[11px] text-[#8B949E]">app.armio.co</span>
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
              className="relative aspect-[16/9] w-full bg-[#161B22]"
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
            className="group inline-flex items-center gap-2.5 rounded-full border border-[#21262D] bg-[#161B22] px-7 py-3.5 text-sm font-semibold text-[#00C47A] transition-all duration-200 hover:border-[#00C47A]/40 hover:bg-[#21262D] active:scale-95"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00C47A]/10 transition-colors group-hover:bg-[#00C47A]/20">
              <Play size={11} className="ml-0.5 text-[#00C47A]" />
            </span>
            Ver adelanto del producto
          </button>
        </motion.div>
      </div>
      <DemoVideo isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
}
