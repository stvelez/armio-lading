'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Instagram, Cookie } from 'lucide-react';
import NewsletterForm from '@/components/forms/NewsletterForm';

export default function Footer() {
  const [showCookieConsent, setShowCookieConsent] = useState(true);

  return (
    <>
      <footer className="bg-[#2C2C2A] border-t border-[#3C3C3A] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Logo & Tagline */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3 tracking-[-0.01em]">armio</h3>
              <p className="text-[#B4B2A9] text-sm mb-6 leading-relaxed">
                El sistema operativo de tu agencia inmobiliaria
              </p>
              <NewsletterForm
                location="footer"
                placeholder="tu@email.com"
                buttonText="Suscribirse"
                className="flex flex-col gap-2"
              />
            </div>

            {/* Producto */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Producto</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Roadmap', 'FAQ'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-[#B4B2A9] hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Empresa</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Carreras', 'Contacto'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-[#B4B2A9] hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-3">
                {['Términos', 'Privacidad', 'Cookies'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-[#B4B2A9] hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#3C3C3A] mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <a
                  href="https://twitter.com/armioapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#888780] hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://linkedin.com/company/armio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#888780] hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://instagram.com/armioapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#888780] hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              </div>

              <div className="flex items-center gap-5 text-[#888780] text-sm">
                <a href="mailto:hola@armio.co" className="hover:text-white transition-colors">
                  hola@armio.co
                </a>
                <span>@armioapp</span>
              </div>

              <div className="text-[#888780] text-sm">
                © {new Date().getFullYear()} Armio ·{' '}
                <a href="https://armio.co" className="hover:text-white transition-colors">
                  armio.co
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2C2C2A] border-t border-[#3C3C3A] p-4 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cookie size={18} className="text-[#1D9E75] flex-shrink-0" />
              <p className="text-[#B4B2A9] text-sm">
                Usamos cookies para mejorar tu experiencia.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCookieConsent(false)}
                className="px-4 py-2 text-[#B4B2A9] hover:text-white text-sm transition-colors"
              >
                Configurar
              </button>
              <button
                onClick={() => setShowCookieConsent(false)}
                className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
