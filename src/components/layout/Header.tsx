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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-[#00C47A] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0D1117] focus:outline-none"
      >
        Ir al contenido principal
      </a>
      <header
        className={[
          "fixed top-0 right-0 left-0 z-50",
          "transition-all duration-300 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
          scrolled
            ? "border-b border-[#21262D] bg-[#0D1117]/90 shadow-[0_2px_12px_rgba(0,0,0,0.3)] backdrop-blur-[12px]"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <span className="text-xl font-semibold tracking-[-0.02em] text-white select-none">
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
                className="text-sm font-medium text-[#8B949E] transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="#cta"
            className="rounded-md bg-[#00C47A] px-4 py-2 text-sm font-semibold text-[#0D1117] shadow-[0_0_16px_rgba(0,196,122,0.3)] transition-all duration-200 hover:bg-[#4DDBA0] hover:shadow-[0_0_24px_rgba(0,196,122,0.45)] active:scale-95"
          >
            Reserva tu acceso
          </a>
        </div>
      </header>
    </>
  );
}
