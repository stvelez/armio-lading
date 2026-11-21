"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Cookie } from "lucide-react";
import {
  CONSENT_KEY,
  PORTAL_NOTICE_KEY,
  getConsentFor,
  setConsentFor,
  getPortalNoticeFor,
  setPortalNoticeFor,
  subscribeConsent,
} from "@/lib/consent";
import { cookiesUrl, privacyUrl } from "@/lib/legal";

/**
 * Variante del aviso:
 * - `consent` (armio.co / marketing): único control real de consentimiento. Hasta que se acepta,
 *   `AnalyticsGate` no carga Google Analytics.
 * - `notice` ({slug}.armio.co / portal): informativo. En el portal no hay GA4 ni cookies de
 *   terceros, así que no se piden permisos que no haría nada conceder: solo se declara la marca
 *   técnica de sesión y se enlaza la política. Afirmar consentimiento de analítica allí sería falso.
 */
export type CookieConsentVariant = "consent" | "notice";

/**
 * Aviso de cookies compartido por marketing y portal.
 * El snapshot de SSR es "accepted" a propósito: evita renderizar el aviso en el servidor
 * (y el salto de hidratación) cuando aún no se sabe la decisión guardada en localStorage.
 */
export default function CookieConsentBanner({
  variant = "consent",
}: {
  variant?: CookieConsentVariant;
}) {
  const storageKey = variant === "consent" ? CONSENT_KEY : PORTAL_NOTICE_KEY;
  const getSnapshot = useCallback(() => getConsentFor(storageKey), [storageKey]);
  // En el servidor se pinta el banner (snapshot `null`): si esperamos a la hidratación
  // para mostrarlo, se convierte en el LCP y retrasa la métrica varios segundos. El
  // cliente lo oculta de inmediato si ya hay consentimiento guardado.
  const consent = useSyncExternalStore(subscribeConsent, getSnapshot, () => null);

  if (consent !== null) return null;

  if (variant === "notice") {
    return (
      // Mismo aviso `.cookie` del prototipo (portal.css): tarjeta flotante abajo a la izquierda.
      <div className="cookie" role="region" aria-label="Aviso de cookies">
        <p>
          Este portal no usa cookies publicitarias ni de terceros: solo cuenta visitas de forma
          anónima y usa una marca técnica de sesión.
        </p>
        <div className="row">
          <a className="btn btn-quiet" href={cookiesUrl} target="_blank" rel="noopener noreferrer">
            Política de cookies
          </a>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPortalNoticeFor("accepted")}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  // Aviso de cookies: la analítica (Google Analytics) solo se carga si se acepta
  return (
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
            sitio. Solo se activan si las aceptas.{" "}
            <a href={cookiesUrl} className="underline transition-colors hover:text-white">
              Política de cookies
            </a>
            .
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
            onClick={() => setConsentFor(CONSENT_KEY, "rejected")}
            className="px-4 py-2 text-sm text-[#8B949E] transition-colors hover:text-white"
          >
            Rechazar
          </button>
          <button
            onClick={() => setConsentFor(CONSENT_KEY, "accepted")}
            className="rounded-md bg-[#00C47A] px-4 py-2 text-sm font-medium text-[#0D1117] transition-colors hover:bg-[#4DDBA0]"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
