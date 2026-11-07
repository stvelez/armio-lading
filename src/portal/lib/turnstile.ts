/**
 * Cloudflare Turnstile en el formulario de interés del portal (ver armio-api/docs/PORTAL_TURNSTILE_PLAN.md).
 *
 * - La site key es pública y Next la incrusta al compilar (NEXT_PUBLIC_*): cambiarla exige redeploy.
 * - Sin site key no se renderiza el widget ni se pide nada a challenges.cloudflare.com.
 * - El script se carga solo desde la URL oficial (no se proxia, cachea ni autoaloja).
 *
 * CSP: hoy el proyecto no emite Content-Security-Policy. Si se añade una, hay que abrir
 * `script-src https://challenges.cloudflare.com` y `frame-src https://challenges.cloudflare.com`;
 * sin eso el script no carga y el formulario no envía (a propósito: ver InterestForm).
 */

export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__armioTurnstileOnload";
export const TURNSTILE_ACTION = "portal-lead";
export const TURNSTILE_LOAD_TIMEOUT_MS = 15_000;

/** Site key pública, o `undefined` si no está configurada (entonces Turnstile queda apagado). */
export function turnstileSiteKey(): string | undefined {
  // Debe leerse literalmente como process.env.NEXT_PUBLIC_*: así Next lo sustituye en el build
  const value = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return value ? value : undefined;
}

export interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: (errorCode?: string | number) => boolean | void;
  "timeout-callback"?: () => void;
  "unsupported-callback"?: () => void;
  "before-interactive-callback"?: () => void;
  "after-interactive-callback"?: () => void;
  "refresh-expired"?: "auto" | "manual" | "never";
  "refresh-timeout"?: "auto" | "manual" | "never";
  retry?: "auto" | "never";
  language?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  execution?: "render" | "execute";
  "response-field"?: boolean;
}

export interface TurnstileApi {
  render(container: HTMLElement | string, options: TurnstileRenderOptions): string | undefined;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
  getResponse?(widgetId?: string): string | undefined;
  isExpired?(widgetId?: string): boolean;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __armioTurnstileOnload?: () => void;
  }
}

export class TurnstileLoadError extends Error {
  constructor(reason: "error" | "timeout") {
    super(`No se pudo cargar Turnstile (${reason})`);
    this.name = "TurnstileLoadError";
  }
}

let pending: Promise<TurnstileApi> | null = null;

/**
 * Carga el script de Turnstile una sola vez. Si ya existe `window.turnstile`, resuelve sin inyectar nada.
 * Al fallar (red, bloqueador, timeout) limpia el estado para que una llamada posterior pueda reintentar.
 */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (typeof window === "undefined") return Promise.reject(new TurnstileLoadError("error"));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (pending) return pending;

  pending = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = setTimeout(() => fail("timeout"), TURNSTILE_LOAD_TIMEOUT_MS);
    const settle = () => {
      clearTimeout(timer);
      pending = null;
      delete window.__armioTurnstileOnload;
    };
    const fail = (reason: "error" | "timeout") => {
      settle();
      script.remove();
      reject(new TurnstileLoadError(reason));
    };

    window.__armioTurnstileOnload = () => {
      if (window.turnstile) {
        const api = window.turnstile;
        settle();
        resolve(api);
      } else {
        fail("error");
      }
    };
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onerror = () => fail("error");
    document.head.appendChild(script);
  });
  return pending;
}
