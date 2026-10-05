"use client";

import { useSyncExternalStore } from "react";
import { Instagram, Cookie } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { trackCTAClick } from "@/lib/analytics";
import { getConsent, setConsent, subscribeConsent } from "@/lib/consent";
import { privacyUrl, termsUrl } from "@/lib/legal";

export default function Footer() {
  // Hasta decidir, no se carga la analítica. SSR devuelve "accepted" para no mostrar el aviso en el servidor.
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => "accepted" as const);
  const showCookieConsent = consent === null;

  return (
    <>
      <footer className="border-t border-[#21262D] bg-[#0D1117] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-4">
            {/* Logo & Tagline */}
            <div>
              <h3 className="mb-3 text-2xl font-semibold tracking-[-0.01em] text-white">armio</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#8B949E]">
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
                      className="text-sm text-[#8B949E] transition-colors hover:text-white"
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
                    className="text-sm text-[#8B949E] transition-colors hover:text-white"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <a
                    href="#cta"
                    onClick={() => trackCTAClick("footer")}
                    className="text-sm text-[#8B949E] transition-colors hover:text-white"
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
                {privacyUrl && termsUrl ? (
                  <>
                    <li>
                      <a
                        href={termsUrl}
                        className="text-sm text-[#8B949E] transition-colors hover:text-white"
                      >
                        Términos y condiciones
                      </a>
                    </li>
                    <li>
                      <a
                        href={privacyUrl}
                        className="text-sm text-[#8B949E] transition-colors hover:text-white"
                      >
                        Política de privacidad
                      </a>
                    </li>
                  </>
                ) : (
                  <li>
                    <span className="text-sm text-[#8B949E]">
                      Política de privacidad y términos disponibles antes del lanzamiento público.
                    </span>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-[#21262D] pt-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-5">
                <a
                  href="https://instagram.com/armioapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8B949E] transition-colors hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              </div>

              <div className="flex items-center gap-5 text-sm text-[#8B949E]">
                <a href="mailto:hola@armio.co" className="transition-colors hover:text-white">
                  hola@armio.co
                </a>
                <span>@armioapp</span>
              </div>

              <div className="text-sm text-[#8B949E]">
                © {new Date().getFullYear()} Armio ·{" "}
                <a href="https://armio.co" className="transition-colors hover:text-white">
                  armio.co
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Aviso de cookies: la analítica (Google Analytics) solo se carga si se acepta */}
      {showCookieConsent && (
        <div
          role="region"
          aria-label="Aviso de cookies"
          className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#21262D] bg-[#161B22] p-4"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex items-start gap-3">
              <Cookie size={18} className="mt-0.5 flex-shrink-0 text-[#00C47A]" />
              <p className="text-sm text-[#8B949E]">
                Usamos cookies de analítica (Google Analytics) para medir las visitas y mejorar el
                sitio. Solo se activan si las aceptas.
                {privacyUrl && (
                  <>
                    {" "}
                    <a href={privacyUrl} className="underline transition-colors hover:text-white">
                      Más información
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setConsent("rejected")}
                className="px-4 py-2 text-sm text-[#8B949E] transition-colors hover:text-white"
              >
                Rechazar
              </button>
              <button
                onClick={() => setConsent("accepted")}
                className="rounded-md bg-[#00C47A] px-4 py-2 text-sm font-medium text-[#0D1117] transition-colors hover:bg-[#4DDBA0]"
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
