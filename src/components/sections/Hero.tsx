"use client";

import { Building2, Users, FileText, BarChart2, MapPin, CheckCircle2 } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import Countdown from "@/components/ui/Countdown";

function ArmioMockup() {
  const sidebarItems = [
    { icon: Building2, label: "Propiedades", active: true },
    { icon: Users, label: "Leads", active: false },
    { icon: FileText, label: "Contratos", active: false },
    { icon: BarChart2, label: "Dashboard", active: false },
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
    {
      name: "Oficina 8B",
      location: "Bogotá · Usaquén",
      price: "$3.200.000",
      status: "Reservada",
      statusColor: "bg-[#FAEEDA] text-[#BA7517]",
    },
  ];

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#D3D1C7] bg-white shadow-2xl">
      {/* Browser bar */}
      <div className="flex items-center gap-3 border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto max-w-[200px] flex-1 rounded-md border border-[#D3D1C7] bg-white/80 px-3 py-1 text-center text-[10px] font-medium text-[#888780]">
          app.armio.co/propiedades
        </div>
      </div>

      {/* App content */}
      <div className="flex" style={{ height: "320px" }}>
        {/* Sidebar */}
        <div className="flex w-[52px] flex-shrink-0 flex-col items-center gap-1 border-r border-[#D3D1C7] bg-[#F1EFE8] py-3">
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              title={label}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                active ? "bg-[#E1F5EE] text-[#1D9E75]" : "text-[#888780] hover:text-[#5F5E5A]"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D3D1C7] bg-white px-4 py-2.5">
            <div>
              <p className="text-[10px] font-medium text-[#888780]">Propiedades</p>
              <p className="text-xs font-semibold text-[#2C2C2A]">Mi cartera</p>
            </div>
            <button className="flex items-center gap-1 rounded-md bg-[#1D9E75] px-2.5 py-1 text-[10px] font-medium text-white">
              <span>+ Nueva</span>
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-2.5">
            {[
              { label: "Activas", value: "24" },
              { label: "Leads", value: "8" },
              { label: "Contratos", value: "3" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-md border border-[#D3D1C7] bg-white px-2 py-1.5 text-center"
              >
                <p className="text-sm font-semibold text-[#1D9E75]">{value}</p>
                <p className="text-[9px] text-[#888780]">{label}</p>
              </div>
            ))}
          </div>

          {/* Table header */}
          <div className="flex items-center gap-3 border-b border-[#D3D1C7] bg-[#F1EFE8] px-4 py-1.5">
            <p className="flex-1 text-[9px] font-medium text-[#5F5E5A]">PROPIEDAD</p>
            <p className="w-16 text-right text-[9px] font-medium text-[#5F5E5A]">PRECIO</p>
            <p className="w-16 text-right text-[9px] font-medium text-[#5F5E5A]">ESTADO</p>
          </div>

          {/* Table rows */}
          <div className="flex-1 overflow-hidden bg-white">
            {properties.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-[#F1EFE8] px-4 py-2 hover:bg-[#F1EFE8]/50"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#E1F5EE]">
                  <MapPin size={10} className="text-[#1D9E75]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium text-[#2C2C2A]">{p.name}</p>
                  <p className="truncate text-[9px] text-[#888780]">{p.location}</p>
                </div>
                <p className="w-16 flex-shrink-0 text-right text-[10px] font-medium text-[#2C2C2A]">
                  {p.price}
                </p>
                <span
                  className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${p.statusColor}`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="waitlist"
      className="relative flex min-h-screen items-center overflow-hidden bg-[#2C2C2A] px-6"
    >
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 50%, rgba(29,158,117,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20">
        {/* Left: Copy */}
        <div>
          {/* Early Access Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1D9E75]/25 bg-[#1D9E75]/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1D9E75]" />
            <span className="text-sm font-medium text-[#5DCAA5]">
              Early Access — Solo 100 cupos
            </span>
          </div>

          {/* Wordmark */}
          <h1 className="mb-5 text-5xl font-semibold tracking-[-0.02em] text-white select-none md:text-6xl">
            armio
          </h1>

          {/* Headline */}
          <h2 className="mb-5 text-2xl leading-snug font-semibold tracking-[-0.01em] text-white md:text-3xl">
            El sistema operativo de tu <span className="text-[#1D9E75]">agencia inmobiliaria</span>
          </h2>

          {/* Subtext */}
          <p className="mb-8 max-w-lg text-base leading-relaxed font-normal text-[#B4B2A9] md:text-lg">
            Centraliza propiedades, leads y contratos en un solo lugar. Deja atrás el Excel y el
            WhatsApp para siempre.
          </p>

          {/* Countdown */}
          <div className="mb-6">
            <Countdown spots={100} spotsTaken={0} />
          </div>

          {/* Newsletter Form */}
          <div className="mb-8">
            <NewsletterForm
              location="hero"
              placeholder="tu@email.com"
              buttonText="Únete a la lista de espera"
              className="flex gap-2"
            />
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#888780]">
            {["Sin tarjeta de crédito", "14 días de prueba", "Cancela cuando quieras"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1D9E75]" strokeWidth={1.5} />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right: Product Mockup */}
        <div className="hidden lg:block">
          <ArmioMockup />
        </div>
      </div>
    </section>
  );
}
