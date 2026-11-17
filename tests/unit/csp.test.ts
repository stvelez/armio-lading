import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildReportOnlyContentSecurityPolicy,
  securityHeaders,
} from "@/lib/security-headers";

/**
 * Guardia de la CSP: la política se construye en `src/lib/security-headers.ts` y se emite desde
 * `next.config.ts`. Aquí se comprueba que no quede vacía, que conserve las directivas clave y que
 * los terceros reales del sitio sigan permitidos. La verificación definitiva es en staging
 * (securityheaders.com / Mozilla Observatory), porque esta prueba no evalúa el navegador.
 */

const prod = buildContentSecurityPolicy({ isDev: false });
const dev = buildContentSecurityPolicy({ isDev: true });
const reportOnly = buildReportOnlyContentSecurityPolicy({ isDev: false });

/** Extrae los valores de una directiva concreta (`default-src 'self'` -> ["'self'"]). */
function directive(policy: string, name: string): string[] {
  const found = policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part === name || part.startsWith(`${name} `));
  return found ? found.split(/\s+/).slice(1) : [];
}

describe("CSP enforcing", () => {
  it("no está vacía y usa directivas separadas por punto y coma", () => {
    expect(prod.trim()).not.toBe("");
    expect(prod).toContain("default-src 'self'");
    expect(prod.split("; ").length).toBeGreaterThanOrEqual(12);
  });

  it.each([
    ["default-src", ["'self'"]],
    ["font-src", ["'self'", "data:"]],
    ["frame-ancestors", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["object-src", ["'none'"]],
  ])("%s contiene %j", (name, values) => {
    expect(directive(prod, name)).toEqual(expect.arrayContaining(values));
  });

  it("script-src permite el propio origen y los scripts reales (Next inline, Turnstile, GA)", () => {
    const values = directive(prod, "script-src");
    expect(values).toContain("'self'");
    expect(values).toContain("'unsafe-inline'");
    expect(values).toContain("https://challenges.cloudflare.com");
    expect(values).toContain("https://www.googletagmanager.com");
    expect(values).not.toContain("'unsafe-eval'");
  });

  it("style-src permite estilos inline (framer-motion y atributos style)", () => {
    expect(directive(prod, "style-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("img-src cubre R2, armio.co, tiles de OSM y Cloudinary", () => {
    const values = directive(prod, "img-src");
    expect(values).toEqual(
      expect.arrayContaining([
        "'self'",
        "data:",
        "blob:",
        "https://*.r2.dev",
        "https://*.armio.co",
        "https://*.tile.openstreetmap.org",
        "https://res.cloudinary.com",
      ])
    );
  });

  it("connect-src cubre API, Sentry, Turnstile y GA4", () => {
    const values = directive(prod, "connect-src");
    expect(values).toEqual(
      expect.arrayContaining([
        "'self'",
        "https://api.armio.co",
        "https://armio-api-staging.up.railway.app",
        "https://*.ingest.sentry.io",
        "https://*.sentry.io",
        "https://challenges.cloudflare.com",
        "https://www.google-analytics.com",
      ])
    );
    expect(values).not.toContain("ws:");
  });

  it("frame-src permite Turnstile y el mapa de OpenStreetMap", () => {
    expect(directive(prod, "frame-src")).toEqual(
      expect.arrayContaining([
        "'self'",
        "https://challenges.cloudflare.com",
        "https://www.openstreetmap.org",
      ])
    );
  });

  it("fuerza HTTPS en producción y no en desarrollo", () => {
    expect(prod.split("; ")).toContain("upgrade-insecure-requests");
    expect(dev.split("; ")).not.toContain("upgrade-insecure-requests");
  });

  it("en desarrollo añade 'unsafe-eval' y el HMR por ws sin filtrarlo a producción", () => {
    expect(directive(dev, "script-src")).toContain("'unsafe-eval'");
    expect(directive(dev, "connect-src")).toContain("ws:");
    expect(prod).not.toContain("'unsafe-eval'");
  });
});

describe("CSP en Report-Only", () => {
  it("es más estricta: quita 'unsafe-inline' de script-src", () => {
    expect(directive(reportOnly, "script-src")).not.toContain("'unsafe-inline'");
    expect(directive(reportOnly, "script-src")).toContain("'self'");
  });

  it("mantiene el resto de directivas de la política enforcing", () => {
    for (const name of ["default-src", "img-src", "frame-src", "frame-ancestors", "base-uri"]) {
      expect(directive(reportOnly, name)).toEqual(directive(prod, name));
    }
  });

  it("no incluye upgrade-insecure-requests (el navegador la ignora en Report-Only)", () => {
    expect(reportOnly).not.toContain("upgrade-insecure-requests");
  });
});

describe("cabeceras de seguridad", () => {
  const headers = Object.fromEntries(
    securityHeaders({ isDev: false }).map((h) => [h.key, h.value])
  );

  it("incluye CSP enforcing y Report-Only, ambas no vacías", () => {
    expect(headers["Content-Security-Policy"]?.length).toBeGreaterThan(0);
    expect(headers["Content-Security-Policy-Report-Only"]?.length).toBeGreaterThan(0);
  });

  it("conserva nosniff, X-Frame-Options y Referrer-Policy", () => {
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("HSTS mantiene 2 años e includeSubDomains y no declara preload", () => {
    expect(headers["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
  });

  it("Permissions-Policy cierra cámara, micrófono, geolocalización, pago y usb", () => {
    const policy = headers["Permissions-Policy"];
    for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"]) {
      expect(policy).toContain(`${feature}=()`);
    }
  });
});

describe("fuente única de cabeceras", () => {
  it("vercel.json no declara headers (se emiten desde next.config.ts)", () => {
    const file = path.resolve(__dirname, "../../vercel.json");
    const config = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    expect(config.headers).toBeUndefined();
  });
});
