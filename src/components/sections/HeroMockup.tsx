"use client";

import { motion } from "framer-motion";
import { Building2, Users, FileText, BarChart2, MapPin } from "lucide-react";

const sidebarItems = [
  { icon: Building2, label: "Propiedades", active: true },
  { icon: Users, label: "Leads", active: false },
  { icon: FileText, label: "Contratos", active: false },
  { icon: BarChart2, label: "Dashboard", active: false },
];

const metrics = [
  { label: "Ventas del mes", value: "$12.5M" },
  { label: "Leads activos", value: "8" },
  { label: "Tasa conversión", value: "37%" },
];

const properties = [
  {
    name: "Apto 201",
    location: "Bogotá · Chapinero",
    price: "$2.800.000",
    status: "Publicada",
    statusColor: "bg-[#EAF3DE] text-[#3B6D11]",
  },
  {
    name: "Casa 45",
    location: "Medellín · El Poblado",
    price: "$4.500.000",
    status: "Verificada",
    statusColor: "bg-[#E6F1FB] text-[#185FA5]",
  },
];

const pipeline = [
  { label: "Nuevo", count: 3, color: "bg-[#E6F1FB] text-[#185FA5]" },
  { label: "En proceso", count: 2, color: "bg-[#FAEEDA] text-[#92400E]" },
  { label: "Cerrado", count: 1, color: "bg-[#EAF3DE] text-[#3B6D11]" },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HeroMockup() {
  return (
    <motion.div
      aria-hidden="true"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full overflow-hidden rounded-xl border border-[#D3D1C7] bg-white shadow-2xl"
    >
      {/* Browser bar */}
      <div className="flex items-center gap-3 border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto max-w-[200px] flex-1 rounded-md border border-[#D3D1C7] bg-white/80 px-3 py-1 text-center text-[10px] font-medium text-[#5F5E5A]">
          app.armio.co/propiedades
        </div>
      </div>

      {/* App content */}
      <div className="flex" style={{ height: "380px" }}>
        {/* Sidebar */}
        <div className="flex w-[52px] flex-shrink-0 flex-col items-center gap-1 border-r border-[#D3D1C7] bg-[#F1EFE8] py-3">
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              title={label}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                active ? "bg-[#E1F5EE] text-[#0F6E56]" : "text-[#5F5E5A]"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col overflow-hidden"
        >
          {/* Header */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between border-b border-[#D3D1C7] bg-white px-4 py-2.5"
          >
            <div>
              <p className="text-[10px] font-medium text-[#5F5E5A]">Propiedades</p>
              <p className="text-xs font-semibold text-[#2C2C2A]">Mi cartera</p>
            </div>
            <button
              tabIndex={-1}
              className="flex items-center gap-1 rounded-md bg-[#0F6E56] px-2.5 py-1 text-[10px] font-medium text-white"
            >
              <span>+ Nueva</span>
            </button>
          </motion.div>

          {/* Metrics */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-3 gap-2 border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-2.5"
          >
            {metrics.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-md border border-[#D3D1C7] bg-white px-2 py-1.5 text-center"
              >
                <p className="text-sm font-semibold text-[#0F6E56]">{value}</p>
                <p className="text-[9px] text-[#5F5E5A]">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Table header */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-1.5"
          >
            <p className="flex-1 text-[9px] font-medium text-[#5F5E5A]">PROPIEDAD</p>
            <p className="w-16 text-right text-[9px] font-medium text-[#5F5E5A]">PRECIO</p>
            <p className="w-16 text-right text-[9px] font-medium text-[#5F5E5A]">ESTADO</p>
          </motion.div>

          {/* Table rows */}
          <div className="border-b border-[#D3D1C7] bg-white">
            {properties.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-center gap-3 border-b border-[#F1EFE8] px-4 py-2"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#E1F5EE]">
                  <MapPin size={10} className="text-[#0F6E56]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium text-[#2C2C2A]">{p.name}</p>
                  <p className="truncate text-[9px] text-[#5F5E5A]">{p.location}</p>
                </div>
                <p className="w-16 flex-shrink-0 text-right text-[10px] font-medium text-[#2C2C2A]">
                  {p.price}
                </p>
                <span
                  className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${p.statusColor}`}
                >
                  {p.status}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Pipeline */}
          <motion.div variants={fadeUp} className="px-4 py-3">
            <p className="mb-2 text-[9px] font-medium text-[#5F5E5A]">PIPELINE DE LEADS</p>
            <div className="flex gap-2">
              {pipeline.map(({ label, count, color }) => (
                <div
                  key={label}
                  className="flex flex-1 flex-col items-center rounded-md border border-[#D3D1C7] py-2"
                >
                  <span className={`mb-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${color}`}>
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-[#2C2C2A]">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
