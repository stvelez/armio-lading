import { defineConfig, devices } from "@playwright/test";

/**
 * E2E de Cloudflare Turnstile con las claves de PRUEBA oficiales de Cloudflare. Requiere salida a internet hacia
 * challenges.cloudflare.com y el API local (como el suite normal). `/api/portal/leads` se intercepta: no crea leads.
 *
 * IMPORTANTE: detén `npm run dev` (puerto 3000) antes de ejecutar `npm run test:e2e:turnstile`: Next 16 no permite dos
 * `next dev` en el mismo directorio y este suite arranca el suyo en el puerto 3100.
 *
 * La site key se incrusta al compilar (NEXT_PUBLIC_*), así que cada variante necesita su propio servidor de
 * desarrollo (nunca reutiliza el del puerto 3000, que corre sin site key). Se elige con TURNSTILE_E2E_VARIANT:
 *
 *   npm run test:e2e:turnstile                                  # pass: 1x00000000000000000000AA (pasa, visible)
 *   TURNSTILE_E2E_VARIANT=fail npm run test:e2e:turnstile        # fail: 2x00000000000000000000AB (siempre falla)
 *   TURNSTILE_E2E_VARIANT=interactive npm run test:e2e:turnstile # interactive: 3x00000000000000000000FF (desafío forzado)
 */
const VARIANTS = {
  pass: "1x00000000000000000000AA",
  fail: "2x00000000000000000000AB",
  interactive: "3x00000000000000000000FF",
} as const;

type Variant = keyof typeof VARIANTS;

const requested = process.env.TURNSTILE_E2E_VARIANT ?? "pass";
if (!(requested in VARIANTS)) {
  throw new Error(`TURNSTILE_E2E_VARIANT debe ser uno de: ${Object.keys(VARIANTS).join(", ")}`);
}
const variant = requested as Variant;

const PORT = 3100;
const ROOT = `localhost:${PORT}`;
const BASE_URL = `http://inmobiliaria-demo.localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /turnstile\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  metadata: { variant },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: `desktop-${variant}`,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://${ROOT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_PORTAL_ROOT_DOMAIN: ROOT,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: VARIANTS[variant],
      PORTAL_API_URL: "http://localhost:4000/api/v1",
    },
  },
});
