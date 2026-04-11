"use client";

import { useEffect, useState } from "react";
import { Instagram, Cookie } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";

const COOKIE_KEY = "armio_cookie_consent";

export default function Footer() {
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      try {
        if (!localStorage.getItem(COOKIE_KEY)) {
          setShowCookieConsent(true);
        }
      } catch {
        setShowCookieConsent(true);
      }
    };
    checkConsent();
  }, []);

  const dismissConsent = () => {
    try {
      localStorage.setItem(COOKIE_KEY, "1");
    } catch {
      // Ignore storage errors in private browsing
    }
    setShowCookieConsent(false);
  };

  return (
    <>
      <footer className="border-t border-[#3C3C3A] bg-[#2C2C2A] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-4">
            {/* Logo & Tagline */}
            <div>
              <h3 className="mb-3 text-2xl font-semibold tracking-[-0.01em] text-white">armio</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#B4B2A9]">
                El sistema que ordena tu operación inmobiliaria
              </p>
              <NewsletterForm
                location="footer"
                placeholder="tu@email.com"
                buttonText="Suscribirse"
                className="flex flex-col gap-2"
              />
            </div>

            {/* Producto */}
            <nav aria-label="Producto">
              <h4 className="mb-4 text-sm font-semibold text-white">Producto</h4>
              <ul className="space-y-3">
                {[
                  { label: "Producto", href: "#features" },
                  { label: "Cómo funciona", href: "#how-it-works" },
                  { label: "Vista del producto", href: "#producto" },
                  { label: "Precios", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-[#B4B2A9] transition-colors hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Empresa */}
            <nav aria-label="Empresa">
              <h4 className="mb-4 text-sm font-semibold text-white">Empresa</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:hola@armio.co"
                    className="text-sm text-[#B4B2A9] transition-colors hover:text-white"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <a
                    href="#cta"
                    className="text-sm text-[#B4B2A9] transition-colors hover:text-white"
                  >
                    Únete a la lista
                  </a>
                </li>
              </ul>
            </nav>

            {/* Legal */}
            <nav aria-label="Legal">
              <h4 className="mb-4 text-sm font-semibold text-white">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-sm text-[#B4B2A9]">
                    Política de privacidad y términos disponibles antes del lanzamiento público.
                  </span>
                </li>
              </ul>
            </nav>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-[#3C3C3A] pt-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-5">
                <a
                  href="https://instagram.com/armioapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B4B2A9] transition-colors hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              </div>

              <div className="flex items-center gap-5 text-sm text-[#B4B2A9]">
                <a href="mailto:hola@armio.co" className="transition-colors hover:text-white">
                  hola@armio.co
                </a>
                <span>@armioapp</span>
              </div>

              <div className="text-sm text-[#B4B2A9]">
                © {new Date().getFullYear()} Armio ·{" "}
                <a href="https://armio.co" className="transition-colors hover:text-white">
                  armio.co
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#3C3C3A] bg-[#2C2C2A] p-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cookie size={18} className="flex-shrink-0 text-[#1D9E75]" />
              <p className="text-sm text-[#B4B2A9]">Usamos cookies para mejorar tu experiencia.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={dismissConsent}
                aria-label="Cerrar aviso de cookies"
                className="px-4 py-2 text-sm text-[#B4B2A9] transition-colors hover:text-white"
              >
                Más tarde
              </button>
              <button
                onClick={dismissConsent}
                aria-label="Aceptar todas las cookies"
                className="rounded-md bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a5242]"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
