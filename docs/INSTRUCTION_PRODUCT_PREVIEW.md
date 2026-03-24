# INSTRUCCIÓN — Reemplazar ProductPreview con capturas reales del backoffice

## Contexto

El archivo `src/components/sections/ProductPreview.tsx` actualmente muestra un mockup
dibujado en código (DashboardMockup). Reemplazarlo con un componente que muestra
capturas reales del backoffice mediante un tab switcher interactivo.

Las capturas están en `public/screenshots/` y son archivos .jpg reales del producto.

---

## Tarea

Reescribir `src/components/sections/ProductPreview.tsx` por completo con el diseño
descrito a continuación. No tocar ningún otro archivo.

---

## Diseño del nuevo ProductPreview

### Estructura general

```
<section bg="#1D9E75" py-24>
  Header (badge + título + descripción)
  Tab switcher horizontal (6 tabs)
  Imagen activa con browser chrome + sombra
  CTA "Ver demo completa" (mantener funcionalidad del modal DemoVideo)
</section>
```

### Tabs — 6 pantallas

| index | label         | icon (lucide)   | imagen                              |
| ----- | ------------- | --------------- | ----------------------------------- |
| 0     | "Dashboard"   | LayoutDashboard | /screenshots/01-dashboard.jpg       |
| 1     | "Propiedades" | Building2       | /screenshots/02-properties-list.jpg |
| 2     | "CRM · Leads" | Users           | /screenshots/07-crm-kanban.jpg      |
| 3     | "Agentes"     | UserCheck       | /screenshots/09-agents.jpg          |
| 4     | "Contratos"   | FileText        | /screenshots/12-contract-create.jpg |
| 5     | "Clientes"    | Contact         | /screenshots/10-clients.jpg         |

### Tab switcher

- Pill container: `bg-[#0F6E56] p-1 rounded-full inline-flex gap-1`
- Tab inactivo: `text-[#E1F5EE] px-4 py-2 rounded-full text-sm hover:bg-[#17845F] transition-colors`
- Tab activo: `bg-white text-[#0F6E56] font-semibold px-4 py-2 rounded-full text-sm shadow-sm`
- Cada tab: ícono 16px + label en flex row con gap-2
- Wrapper del switcher en mobile: `overflow-x-auto` con `scrollbar-hide`

### Imagen del producto

```tsx
<div className="overflow-hidden rounded-2xl border border-[#D3D1C7] shadow-2xl">
  {/* Browser chrome */}
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
  {/* Screenshot */}
  <div className="relative aspect-[16/9] w-full bg-[#F1EFE8]">
    <Image
      src={tabs[active].image}
      alt={tabs[active].label}
      fill
      className="object-cover object-top"
      priority={active === 0}
    />
  </div>
</div>
```

### Animación de cambio de tab

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={active}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    {/* browser chrome + imagen */}
  </motion.div>
</AnimatePresence>
```

### Auto-rotación

```tsx
useEffect(() => {
  if (isPaused) return;
  const id = setInterval(() => {
    setActive((prev) => (prev + 1) % tabs.length);
  }, 4000);
  return () => clearInterval(id);
}, [isPaused]);
```

Pausar en hover sobre el contenedor del screenshot:

```tsx
<div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
  {/* AnimatePresence + imagen */}
</div>
```

### Indicador de progreso (opcional pero recomendado)

Barra de progreso debajo de los tabs que muestra cuánto falta para el siguiente auto-avance:

```tsx
<div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-[#0F6E56]">
  <motion.div
    key={active}
    className="h-full rounded-full bg-white/60"
    initial={{ width: "0%" }}
    animate={{ width: "100%" }}
    transition={{ duration: 4, ease: "linear" }}
  />
</div>
```

### CTA

Mantener exactamente igual al actual:

```tsx
<button
  onClick={() => setShowModal(true)}
  className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0F6E56] shadow-md transition-all duration-200 hover:bg-[#F1EFE8] active:scale-95"
>
  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E1F5EE] transition-colors group-hover:bg-[#D3D1C7]">
    <Play size={11} className="ml-0.5" />
  </span>
  Ver demo completa
</button>
<DemoVideo isOpen={showModal} onClose={() => setShowModal(false)} />
```

---

## Imports necesarios

```tsx
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
```

---

## Interface de tipos

```tsx
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
```

---

## Notas finales

- Eliminar completamente `DashboardMockup` y el import de `Hotspot`
- Mantener el import de `DemoVideo`
- El header (badge + h2 + p) puede mantenerse igual al actual
- Usar `next/image` con `fill` y `object-cover object-top`, nunca `<img>` nativo
- TypeScript strict: no dejar `any` implícitos
- El componente sigue siendo `"use client"` por los estados
