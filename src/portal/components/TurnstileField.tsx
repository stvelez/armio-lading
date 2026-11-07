"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { TURNSTILE_ACTION, loadTurnstile, type TurnstileApi } from "../lib/turnstile";

/** Por qué no se pudo obtener el token (el formulario elige el mensaje). */
export type TurnstileFailure = "load" | "browser" | "config" | "generic" | "timeout";

export class TurnstileFlowError extends Error {
  constructor(
    public readonly kind: TurnstileFailure,
    public readonly code?: string
  ) {
    super(`Turnstile: ${kind}${code ? ` (${code})` : ""}`);
    this.name = "TurnstileFlowError";
  }
}

export interface TurnstileHandle {
  /** Carga el script y dibuja el widget. Idempotente; si falló la carga, reintenta. */
  start(): void;
  /** Token vigente, o espera al que está en camino. Rechaza con TurnstileFlowError. */
  getToken(timeoutMs?: number): Promise<string>;
  /** El token es de un solo uso: descartarlo y pedir uno nuevo. */
  reset(): void;
}

const TOKEN_WAIT_MS = 20_000;
/** El token vive 300 s en Cloudflare; con más de 240 s se pide uno nuevo antes de enviar. */
const TOKEN_MAX_AGE_MS = 240_000;

/** 300xxx/600xxx: falló el chequeo del navegador; 110xxx: configuración; el resto (100xxx…): recargar. */
export function classifyTurnstileError(code: string | number | undefined): TurnstileFailure {
  const text = String(code ?? "");
  if (/^(300|600)/.test(text)) return "browser";
  if (/^110/.test(text)) return "config";
  return "generic";
}

type Waiter = { resolve: (token: string) => void; reject: (error: TurnstileFlowError) => void };

interface Props {
  siteKey: string;
  ref?: Ref<TurnstileHandle>;
}

export default function TurnstileField({ siteKey, ref }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const api = useRef<TurnstileApi | null>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const loading = useRef(false);
  const mounted = useRef(false);
  const token = useRef<string | null>(null);
  const tokenAt = useRef(0);
  const pendingError = useRef<TurnstileFlowError | null>(null);
  const waiters = useRef<Waiter[]>([]);
  const [verified, setVerified] = useState(false);
  const [started, setStarted] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const settle = useCallback((error: TurnstileFlowError) => {
    if (waiters.current.length === 0) {
      pendingError.current = error;
      return;
    }
    const list = waiters.current;
    waiters.current = [];
    for (const w of list) w.reject(error);
  }, []);

  const render = useCallback(
    (turnstile: TurnstileApi) => {
      if (!container.current || widgetId.current !== undefined) return;
      widgetId.current = turnstile.render(container.current, {
        sitekey: siteKey,
        action: TURNSTILE_ACTION,
        appearance: "interaction-only",
        size: "flexible",
        theme: "light",
        language: "es",
        "refresh-expired": "auto",
        "refresh-timeout": "auto",
        retry: "auto",
        "response-field": false,
        callback: (value) => {
          token.current = value;
          tokenAt.current = Date.now();
          pendingError.current = null;
          setVerified(true);
          setInteractive(false);
          const list = waiters.current;
          waiters.current = [];
          for (const w of list) w.resolve(value);
        },
        "expired-callback": () => {
          token.current = null;
          setVerified(false);
        },
        "error-callback": (code) => {
          token.current = null;
          setVerified(false);
          const kind = classifyTurnstileError(code);
          if (kind === "config") console.warn("Turnstile: error de configuración", code);
          settle(new TurnstileFlowError(kind, code === undefined ? undefined : String(code)));
          return true; // manejado: evita la excepción por defecto del widget
        },
        "timeout-callback": () => {
          token.current = null;
          setVerified(false);
          settle(new TurnstileFlowError("timeout"));
        },
        "unsupported-callback": () => {
          settle(new TurnstileFlowError("browser"));
        },
        "before-interactive-callback": () => setInteractive(true),
        "after-interactive-callback": () => setInteractive(false),
      });
    },
    [siteKey, settle]
  );

  const start = useCallback(() => {
    if (loading.current || widgetId.current !== undefined) return;
    loading.current = true;
    setStarted(true);
    loadTurnstile().then(
      (turnstile) => {
        loading.current = false;
        if (!mounted.current) return;
        api.current = turnstile;
        render(turnstile);
      },
      () => {
        loading.current = false;
        setStarted(false);
        if (mounted.current) settle(new TurnstileFlowError("load"));
      }
    );
  }, [render, settle]);

  const reset = useCallback(() => {
    token.current = null;
    setVerified(false);
    if (widgetId.current !== undefined) api.current?.reset(widgetId.current);
  }, []);

  const getToken = useCallback(
    (timeoutMs = TOKEN_WAIT_MS) => {
      if (token.current) {
        const stale =
          Date.now() - tokenAt.current > TOKEN_MAX_AGE_MS ||
          (widgetId.current !== undefined && api.current?.isExpired?.(widgetId.current) === true);
        if (!stale) return Promise.resolve(token.current);
        // Token viejo o caducado: se descarta y se espera el nuevo (mismo mecanismo y timeout)
        reset();
      }
      if (pendingError.current) {
        // Un error ocurrido antes del envío: se informa una vez y el siguiente intento reinicia el widget
        const error = pendingError.current;
        pendingError.current = null;
        if (widgetId.current !== undefined) api.current?.reset(widgetId.current);
        else start(); // falló la carga del script: el próximo intento vuelve a pedirlo
        return Promise.reject(error);
      }
      return new Promise<string>((resolve, reject) => {
        const waiter: Waiter = {
          resolve: (value) => {
            clearTimeout(timer);
            resolve(value);
          },
          reject: (error) => {
            clearTimeout(timer);
            reject(error);
          },
        };
        const timer = setTimeout(() => {
          waiters.current = waiters.current.filter((w) => w !== waiter);
          reject(new TurnstileFlowError("timeout"));
        }, timeoutMs);
        waiters.current.push(waiter);
        start();
      });
    },
    [start, reset]
  );

  useImperativeHandle(ref, () => ({ start, getToken, reset }), [start, getToken, reset]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (widgetId.current !== undefined) api.current?.remove(widgetId.current);
      widgetId.current = undefined;
      const list = waiters.current;
      waiters.current = [];
      for (const w of list) w.reject(new TurnstileFlowError("generic"));
    };
  }, []);

  return (
    <div>
      <div ref={container} />
      <p className="sr-only" aria-live="polite">
        {verified ? "Verificación completada" : started ? "Verificando que eres una persona…" : ""}
      </p>
      <div role="status" aria-live="polite">
        {interactive && !verified && (
          <p className="mt-2 text-sm text-stone-700">
            Marca la casilla para confirmar que eres una persona.
          </p>
        )}
      </div>
    </div>
  );
}
