"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      setHidden(currentY > lastY && currentY > 100);
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[#1D9E75] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
      >
        Ir al contenido principal
      </a>
      <header
        className={[
          "fixed top-0 right-0 left-0 z-50",
          "transition-all duration-300 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
          scrolled
            ? "border-b border-[#D3D1C7] bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-[12px]"
            : "bg-[#F1EFE8]/80 backdrop-blur-[8px]",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <span className="text-xl font-semibold tracking-[-0.02em] text-[#2C2C2A] select-none">
            armio
          </span>

          {/* Nav links — desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            {[
              { label: "Producto", href: "#features" },
              { label: "Cómo funciona", href: "#how-it-works" },
              { label: "Precios", href: "#pricing" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-[#5F5E5A] transition-colors hover:text-[#2C2C2A]"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="#cta"
            className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0F6E56] active:scale-95"
          >
            Reserva tu acceso
          </a>
        </div>
      </header>
    </>
  );
}
