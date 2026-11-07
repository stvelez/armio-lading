"use client";

import { useEffect, useRef } from "react";
import {
  BOT_UA,
  classifyVisitSource,
  sanitizeUtm,
  type VisitPage,
  type VisitSource,
} from "@/portal/lib/visit-source";

/**
 * Contador de visitas del portal: cuenta UNA vista cuando la página se muestra de verdad. Renderiza `null`.
 * Sin cookies ni seguimiento: envía solo la página, la categoría de origen y UTM saneadas; el referrer y la URL
 * nunca salen del navegador. No usa `usePathname`/`useSearchParams` (no cambia el modo de render de las páginas).
 * Diseño: armio-api/docs/PORTAL_ANALYTICS_PLAN.md §3.2.
 */

const ENDPOINT = "/api/portal/visits";
const TEAM_KEY = "armio:equipo";
const TEAM_HASH = "#equipo-armio";

/** Una limpieza posterior a este tiempo desde el envío ya no es el doble montaje de StrictMode. */
const RESEND_AFTER_MS = 1000;

/** ¿Ya se envió la primera vista de este documento? Se reinicia en cada carga completa (navegación SPA no). */
let firstViewSent = false;

function inTeamTab(): boolean {
  try {
    return window.sessionStorage.getItem(TEAM_KEY) === "1";
  } catch {
    return false;
  }
}

function markTeamTab(): void {
  try {
    window.sessionStorage.setItem(TEAM_KEY, "1");
  } catch {
    /* sin almacenamiento: el hash igual se quita y esta carga no cuenta */
  }
}

function post(body: string): void {
  try {
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(ENDPOINT, body)) return;
  } catch {
    /* se intenta con fetch */
  }
  try {
    fetch(ENDPOINT, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {});
  } catch {
    /* el contador nunca rompe la página */
  }
}

function buildBody(page: VisitPage, code: number | undefined): string {
  const body: {
    page: VisitPage;
    code?: number;
    source: VisitSource;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  } = { page, source: "interno" };
  if (page === "property" && code !== undefined) body.code = code;

  if (!firstViewSent) {
    const params = new URL(window.location.href).searchParams;
    const utmSource = sanitizeUtm(params.get("utm_source"));
    const utmMedium = sanitizeUtm(params.get("utm_medium"));
    const utmCampaign = sanitizeUtm(params.get("utm_campaign"));
    body.source = classifyVisitSource(document.referrer, window.location.host, utmSource);
    if (utmSource) body.utm_source = utmSource;
    if (utmMedium) body.utm_medium = utmMedium;
    if (utmCampaign) body.utm_campaign = utmCampaign;
  }
  return JSON.stringify(body);
}

export default function VisitBeacon({ page, code }: { page: VisitPage; code?: number }) {
  // Evita un segundo envío si React monta dos veces (StrictMode en desarrollo)
  const sentFor = useRef<string | null>(null);
  const sentAt = useRef(0);

  useEffect(() => {
    try {
      const key = `${page}:${code ?? ""}`;
      if (sentFor.current === key) return;
      if (navigator.webdriver === true) return;
      if (BOT_UA.test(navigator.userAgent || "")) return;
      if (inTeamTab()) return;

      if (window.location.hash === TEAM_HASH) {
        markTeamTab();
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search
        );
        return;
      }

      const cleanups: Array<() => void> = [];
      const waitFor = (target: Document, event: string, then: () => void) => {
        const handler = () => then();
        target.addEventListener(event, handler, { once: true });
        cleanups.push(() => target.removeEventListener(event, handler));
      };

      const send = () => {
        if (sentFor.current === key) return;
        // Una pestaña en segundo plano no cuenta hasta que se vea
        if (document.visibilityState !== "visible") {
          waitFor(document, "visibilitychange", send);
          return;
        }
        sentFor.current = key;
        sentAt.current = Date.now();
        post(buildBody(page, code));
        firstViewSent = true;
      };

      // Prerender especulativo: no cuenta hasta que el usuario realmente abre la página
      if ((document as Document & { prerendering?: boolean }).prerendering) {
        waitFor(document, "prerenderingchange", send);
      } else {
        send();
      }

      return () => {
        cleanups.forEach((fn) => fn());
        // El doble montaje síncrono de StrictMode limpia casi al instante (conserva la marca y no reenvía);
        // si la limpieza llega más tarde (p. ej. <Activity> oculto de Next 16 al navegar y volver), la página
        // vuelve a contar al mostrarse de nuevo.
        if (sentFor.current === key && Date.now() - sentAt.current > RESEND_AFTER_MS) {
          sentFor.current = null;
        }
      };
    } catch {
      /* el contador nunca rompe la página */
    }
  }, [page, code]);

  return null;
}
