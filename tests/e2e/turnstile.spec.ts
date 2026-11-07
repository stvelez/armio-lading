import { expect, test, type Page } from "@playwright/test";

/**
 * E2E de Turnstile con claves de prueba de Cloudflare. Se corre con `npm run test:e2e:turnstile`
 * (ver playwright.turnstile.config.ts): requiere internet hacia challenges.cloudflare.com.
 * `/api/portal/leads` está interceptado: no se crean leads. La variante la fija TURNSTILE_E2E_VARIANT
 * (pass | fail | interactive) porque la site key se incrusta al compilar.
 */

const VARIANT = process.env.TURNSTILE_E2E_VARIANT ?? "pass";
const PROPERTY_URL = "/propiedades/9-penthouse-con-terraza-en-granada";
const DUMMY_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const CLOUDFLARE = /challenges\.cloudflare\.com/;

/**
 * Espera a que React hidrate el formulario (tiene props de React). Antes de eso `onSubmit` no existe y un clic en
 * Enviar haría el envío nativo del navegador (GET con los datos en la URL). Con `next dev` la hidratación puede
 * tardar segundos en la primera compilación, así que llenar y pulsar de inmediato es una carrera.
 */
const waitForHydration = (page: Page) =>
  page.waitForFunction(() => {
    const form = document.querySelector("form");
    return !!form && Object.keys(form).some((key) => key.startsWith("__reactProps"));
  });

const fill = async (page: Page) => {
  await waitForHydration(page);
  await page.getByLabel("Nombre", { exact: true }).fill("Ana Pérez");
  await page.getByLabel(/Teléfono o WhatsApp/).fill("3001234567");
  await page.getByLabel(/Autorizo a/).check();
};

/** Cuenta (y opcionalmente responde) los POST al proxy del formulario. */
async function interceptLeads(page: Page, statuses: number[] = [202]) {
  const bodies: Record<string, unknown>[] = [];
  await page.route("**/api/portal/leads", (route) => {
    bodies.push(route.request().postDataJSON() as Record<string, unknown>);
    const status = statuses[Math.min(bodies.length - 1, statuses.length - 1)];
    return route.fulfill({
      status,
      json: status === 202 ? { received: true } : { error: "unavailable" },
    });
  });
  return bodies;
}

test.describe("Turnstile (sitekey que pasa)", () => {
  test.skip(VARIANT !== "pass", "variante pass");

  test("1. no pide nada a Cloudflare hasta interactuar con el formulario", async ({ page }) => {
    const seen: string[] = [];
    page.on("request", (req) => {
      if (CLOUDFLARE.test(req.url())) seen.push(req.url());
    });
    await page.goto(PROPERTY_URL);
    await page.waitForLoadState("networkidle");
    expect(seen).toHaveLength(0);

    const apiRequest = page.waitForRequest(
      /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/
    );
    await waitForHydration(page);
    await page.getByLabel("Nombre", { exact: true }).focus();
    await apiRequest;
  });

  test("2. envío válido: el cuerpo lleva el token y se ve el agradecimiento", async ({ page }) => {
    const bodies = await interceptLeads(page);
    await page.goto(PROPERTY_URL);
    await fill(page);
    await page.getByRole("button", { name: /^(Enviar|Verificando…)$/ }).click();
    await expect(page.getByText("¡Gracias por tu interés!")).toBeVisible();
    expect(bodies).toHaveLength(1);
    expect(bodies[0].turnstile_token).toBe(DUMMY_TOKEN);
  });

  test("3. tras un 502 el widget se reinicia y el segundo envío lleva token otra vez", async ({
    page,
  }) => {
    const bodies = await interceptLeads(page, [502, 202]);
    await page.goto(PROPERTY_URL);
    await fill(page);
    // Cuenta los reinicios del widget (el token es de un solo uso)
    await page.getByLabel("Nombre", { exact: true }).focus();
    await page.waitForFunction(() => Boolean(window.turnstile));
    await page.evaluate(() => {
      const w = window as unknown as {
        __resets: number;
        turnstile: { reset: (id?: string) => void };
      };
      w.__resets = 0;
      const original = w.turnstile.reset.bind(w.turnstile);
      w.turnstile.reset = (id) => {
        w.__resets++;
        original(id);
      };
    });

    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(/No pudimos enviar tu mensaje/)).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __resets: number }).__resets)).toBe(1);

    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("¡Gracias por tu interés!")).toBeVisible();
    expect(bodies).toHaveLength(2);
    expect(bodies[1].turnstile_token).toBe(DUMMY_TOKEN);
  });

  test("4. si el script de Cloudflare no carga, avisa y no envía", async ({ page }) => {
    await page.route(CLOUDFLARE, (route) => route.abort());
    const bodies = await interceptLeads(page);
    await page.goto(PROPERTY_URL);
    await fill(page);
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(/No pudimos cargar la verificación de seguridad/)).toBeVisible();
    expect(bodies).toHaveLength(0);
  });
});

test.describe("Turnstile (sitekey que siempre falla)", () => {
  test.skip(VARIANT !== "fail", "variante fail: TURNSTILE_E2E_VARIANT=fail");

  test("5. muestra un error de verificación y no llama al proxy", async ({ page }) => {
    const bodies = await interceptLeads(page);
    await page.goto(PROPERTY_URL);
    await fill(page);
    await page.getByRole("button", { name: /^(Enviar|Verificando…)$/ }).click();
    await expect(
      page.getByText(
        /No pudimos verificar tu navegador|Hubo un problema con la verificación|La verificación/
      )
    ).toBeVisible();
    expect(bodies).toHaveLength(0);
  });
});

test.describe("Turnstile (desafío interactivo forzado)", () => {
  test.skip(VARIANT !== "interactive", "variante interactive: TURNSTILE_E2E_VARIANT=interactive");

  const challenge = (page: Page) => page.frameLocator('iframe[src*="challenges.cloudflare.com"]');

  // Marcar la casilla dentro del iframe de Cloudflare puede ser inestable en CI
  test.fixme("6. aparece el iframe y el texto; al marcar la casilla se envía con token", async ({
    page,
  }) => {
    const bodies = await interceptLeads(page);
    await page.goto(PROPERTY_URL);
    await fill(page);
    await page.getByLabel("Nombre", { exact: true }).focus();
    await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toBeVisible();
    await expect(
      page.getByText("Marca la casilla para confirmar que eres una persona.")
    ).toBeVisible();
    await challenge(page).locator("input[type=checkbox], label").first().click();
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("¡Gracias por tu interés!")).toBeVisible();
    expect(bodies[0].turnstile_token).toBeTruthy();
  });

  test("7. el iframe se alcanza con Tab antes del botón Enviar", async ({ page }) => {
    await page.goto(PROPERTY_URL);
    await waitForHydration(page);
    await page.getByLabel("Nombre", { exact: true }).focus();
    const iframe = page.locator('iframe[src*="challenges.cloudflare.com"]');
    await expect(iframe).toBeVisible();
    await page.getByLabel(/Quiero recibir ofertas/).focus();
    await page.keyboard.press("Tab");
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBe("IFRAME");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Enviar" })).toBeFocused();
  });
});
