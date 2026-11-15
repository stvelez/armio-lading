"use client";

import { Instagram } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { trackCTAClick } from "@/lib/analytics";
import { cookiesUrl, privacyUrl, termsUrl } from "@/lib/legal";

/**
 * El aviso de cookies ya no vive aquí: se monta en `(marketing)/layout.tsx` vía
 * `CookieConsentBanner`, para que aparezca en todas las rutas y no solo donde se use el Footer.
 */
export default function Footer() {
  return (
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
              {/*
               * El enlace de Política de cookies es una ruta estática y se
               * muestra siempre; los demás (términos/privacidad) solo se
               * renderizan si su URL de configuración está disponible, para
               * no dejar la sección legal vacía. El aviso de cookies sigue
               * siendo el control real de consentimiento en cualquier caso.
               */}
              <li>
                <a
                  href={cookiesUrl}
                  className="text-sm text-[#8B949E] transition-colors hover:text-white"
                >
                  Política de cookies
                </a>
              </li>
              {termsUrl && (
                <li>
                  <a
                    href={termsUrl}
                    className="text-sm text-[#8B949E] transition-colors hover:text-white"
                  >
                    Términos y condiciones
                  </a>
                </li>
              )}
              {privacyUrl && (
                <li>
                  <a
                    href={privacyUrl}
                    className="text-sm text-[#8B949E] transition-colors hover:text-white"
                  >
                    Política de privacidad
                  </a>
                </li>
              )}
              {!termsUrl && !privacyUrl && (
                <li>
                  <span className="text-sm text-[#8B949E]">
                    Todas las políticas se publicarán antes del lanzamiento público.
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
  );
}
