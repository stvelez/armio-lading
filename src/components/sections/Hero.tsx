'use client';

import {
  Building2,
  Users,
  FileText,
  BarChart2,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import NewsletterForm from '@/components/forms/NewsletterForm';
import Countdown from '@/components/ui/Countdown';

function ArmioMockup() {
  const sidebarItems = [
    { icon: Building2, label: 'Propiedades', active: true },
    { icon: Users, label: 'Leads', active: false },
    { icon: FileText, label: 'Contratos', active: false },
    { icon: BarChart2, label: 'Dashboard', active: false },
  ];

  const properties = [
    { name: 'Apto 201', location: 'Bogotá · Chapinero', price: '$2.800.000', status: 'Publicada', statusColor: 'bg-[#EAF3DE] text-[#3B6D11]' },
    { name: 'Casa 45', location: 'Medellín · El Poblado', price: '$4.500.000', status: 'Verificada', statusColor: 'bg-[#E6F1FB] text-[#185FA5]' },
    { name: 'Oficina 8B', location: 'Bogotá · Usaquén', price: '$3.200.000', status: 'Reservada', statusColor: 'bg-[#FAEEDA] text-[#BA7517]' },
  ];

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-[#D3D1C7] bg-white w-full">
      {/* Browser bar */}
      <div className="bg-[#F1EFE8] border-b border-[#D3D1C7] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 bg-white/80 rounded-md px-3 py-1 text-[10px] text-[#888780] font-medium max-w-[200px] mx-auto text-center border border-[#D3D1C7]">
          app.armio.co/propiedades
        </div>
      </div>

      {/* App content */}
      <div className="flex" style={{ height: '320px' }}>
        {/* Sidebar */}
        <div className="w-[52px] bg-[#F1EFE8] border-r border-[#D3D1C7] flex flex-col items-center py-3 gap-1 flex-shrink-0">
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              title={label}
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                active
                  ? 'bg-[#E1F5EE] text-[#1D9E75]'
                  : 'text-[#888780] hover:text-[#5F5E5A]'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#D3D1C7] bg-white">
            <div>
              <p className="text-[10px] text-[#888780] font-medium">Propiedades</p>
              <p className="text-xs font-semibold text-[#2C2C2A]">Mi cartera</p>
            </div>
            <button className="bg-[#1D9E75] text-white text-[10px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
              <span>+ Nueva</span>
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 px-4 py-2.5 bg-[#F1EFE8] border-b border-[#D3D1C7]">
            {[
              { label: 'Activas', value: '24' },
              { label: 'Leads', value: '8' },
              { label: 'Contratos', value: '3' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-md px-2 py-1.5 text-center border border-[#D3D1C7]">
                <p className="text-sm font-semibold text-[#1D9E75]">{value}</p>
                <p className="text-[9px] text-[#888780]">{label}</p>
              </div>
            ))}
          </div>

          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-1.5 bg-[#F1EFE8] border-b border-[#D3D1C7]">
            <p className="text-[9px] font-medium text-[#5F5E5A] flex-1">PROPIEDAD</p>
            <p className="text-[9px] font-medium text-[#5F5E5A] w-16 text-right">PRECIO</p>
            <p className="text-[9px] font-medium text-[#5F5E5A] w-16 text-right">ESTADO</p>
          </div>

          {/* Table rows */}
          <div className="flex-1 overflow-hidden bg-white">
            {properties.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2 border-b border-[#F1EFE8] hover:bg-[#F1EFE8]/50"
              >
                <div className="w-6 h-6 bg-[#E1F5EE] rounded flex items-center justify-center flex-shrink-0">
                  <MapPin size={10} className="text-[#1D9E75]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-[#2C2C2A] truncate">{p.name}</p>
                  <p className="text-[9px] text-[#888780] truncate">{p.location}</p>
                </div>
                <p className="text-[10px] font-medium text-[#2C2C2A] w-16 text-right flex-shrink-0">{p.price}</p>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${p.statusColor}`}>
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
    <section className="relative min-h-screen flex items-center px-6 overflow-hidden bg-[#2C2C2A]">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 20% 50%, rgba(29,158,117,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Copy */}
        <div>
          {/* Early Access Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1D9E75]/10 border border-[#1D9E75]/25 rounded-full px-3.5 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-pulse" />
            <span className="text-[#5DCAA5] text-sm font-medium">
              Early Access — Solo 100 cupos
            </span>
          </div>

          {/* Wordmark */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.02em] text-white mb-5 select-none">
            armio
          </h1>

          {/* Headline */}
          <h2 className="text-2xl md:text-3xl font-semibold text-white leading-snug tracking-[-0.01em] mb-5">
            El sistema operativo de tu{' '}
            <span className="text-[#1D9E75]">agencia inmobiliaria</span>
          </h2>

          {/* Subtext */}
          <p className="text-[#B4B2A9] text-base md:text-lg font-normal leading-relaxed mb-8 max-w-lg">
            Centraliza propiedades, leads y contratos en un solo lugar.
            Deja atrás el Excel y el WhatsApp para siempre.
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
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[#888780] text-sm">
            {[
              'Sin tarjeta de crédito',
              '14 días de prueba',
              'Cancela cuando quieras',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#1D9E75]" strokeWidth={1.5} />
                <span>{item}</span>
              </div>
            ))}
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
