import { expect, test, type Page } from "@playwright/test";

/**
 * E2E del portal público. Requiere el API local en http://localhost:4000 con el tenant
 * `inmobiliaria-demo` (6 propiedades públicas; code 9 'both' con 2 fotos; varias sin fotos).
 */

const TENANT = "inmobiliaria-demo";
const PORTAL = `/p/${TENANT}`;
const CANONICAL_SLUG = "9-penthouse-con-terraza-en-granada";
const PROPERTY_URL = `${PORTAL}/propiedades/${CANONICAL_SLUG}`;

// PNG 1x1: las fotos viven en r2.dev; así las pruebas no dependen de la red externa.
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAf5LzJQAAAABJRU5ErkJggg==",
  "base64"
);

test.beforeEach(async ({ page }) => {
  await page.route(/\.r2\.dev\//, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PIXEL })
  );
});

async function noHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

/** Devuelve el contenedor de filtros visible: la hoja en móvil, la barra lateral en escritorio. */
async function openFilters(page: Page) {
  const trigger = page.getByRole("button", { name: /^Filtros/ });
  if (await trigger.isVisible()) {
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Filtros" });
    await expect(sheet).toBeVisible();
    return sheet;
  }
  return page.getByRole("complementary", { name: "Filtros" });
}

test.describe("inicio y listado", () => {
  test("el inicio carga con el nombre de la inmobiliaria", async ({ page }) => {
    const res = await page.goto(PORTAL);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Inmobiliaria Demo/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Inmobiliaria Demo").first()).toBeVisible();
  });

  test("el listado muestra las 6 propiedades públicas", async ({ page }) => {
    await page.goto(`${PORTAL}/propiedades`);
    await expect(page.getByText("6 propiedades", { exact: true })).toBeVisible();
    await expect(page.locator("h3 a[href*='/propiedades/']")).toHaveCount(6);
  });

  test("los filtros cambian la URL y los resultados", async ({ page }) => {
    await page.goto(`${PORTAL}/propiedades`);
    const filters = await openFilters(page);
    await filters.getByLabel("Operación").selectOption("venta");
    await filters.getByRole("button", { name: "Buscar" }).click();

    await expect(page).toHaveURL(/\/propiedades\?operacion=venta$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Propiedades en venta");
    await expect(page.getByText("5 propiedades", { exact: true })).toBeVisible();
    await expect(page.locator("h3 a[href*='/propiedades/']")).toHaveCount(5);
  });

  test("filtros sin resultados muestran el estado vacío y se pueden limpiar", async ({ page }) => {
    await page.goto(`${PORTAL}/propiedades?operacion=arriendo&precio_min=9000000000`);
    await expect(page.getByText("Sin resultados")).toBeVisible();
    await page.getByRole("link", { name: "Ver todas las propiedades" }).click();
    await expect(page).toHaveURL(/\/propiedades$/);
    await expect(page.getByText("6 propiedades", { exact: true })).toBeVisible();
  });

  test("parámetros inválidos se ignoran sin romper la página", async ({ page }) => {
    const res = await page.goto(`${PORTAL}/propiedades?operacion=regalo&page=-3&orden=xx`);
    expect(res?.status()).toBe(200);
    await expect(page.getByText("6 propiedades", { exact: true })).toBeVisible();
  });

  test("filtros no canónicos llevan noindex y canónica sin ellos", async ({ page }) => {
    await page.goto(`${PORTAL}/propiedades?operacion=venta&tipo=apartamento`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https?:\/\/.+\/p\/inmobiliaria-demo\/propiedades\?operacion=venta$/
    );
  });
});

test.describe("ficha de propiedad", () => {
  test("/propiedades/9 redirige 308 a la URL canónica", async ({ request, page }) => {
    const res = await request.get(`${PORTAL}/propiedades/9`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toContain(PROPERTY_URL);

    await page.goto(`${PORTAL}/propiedades/9`);
    await expect(page).toHaveURL(new RegExp(`${PROPERTY_URL}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Penthouse con terraza en Granada"
    );
  });

  test("muestra la galería, abre el visor y avanza con el teclado", async ({ page }) => {
    await page.goto(PROPERTY_URL);
    await expect(page.getByText("1 / 2").first()).toBeVisible();

    await page.getByRole("button", { name: "Ampliar foto 1 de 2" }).click();
    const viewer = page.getByRole("dialog", { name: /Galería de/ });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText("1 / 2")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText("2 / 2")).toBeVisible();
    await page.keyboard.press("ArrowRight"); // vuelve al inicio
    await expect(viewer.getByText("1 / 2")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(viewer.getByText("2 / 2")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("propiedad 'both': etiqueta, nota de consulta y sin /mes", async ({ page }) => {
    await page.goto(PROPERTY_URL);
    const main = page.locator("main, body").first();
    await expect(main.getByText("Arriendo y venta").first()).toBeVisible();
    await expect(
      page.getByText("Consulta el valor de arriendo o de venta con la inmobiliaria")
    ).toBeVisible();
    await expect(page.getByText("/mes", { exact: true })).toHaveCount(0);
  });

  test("propiedad sin fotos muestra el marcador de posición", async ({ page }) => {
    await page.goto(`${PORTAL}/propiedades/8`);
    await expect(page).toHaveURL(/\/propiedades\/8-casa-remodelada-en-ciudad-jardin$/);
    await expect(page.getByText("Esta propiedad aún no tiene fotos")).toBeAttached();
    await expect(page.getByRole("button", { name: /Ampliar foto/ })).toHaveCount(0);
  });

  test("trae og:*, canónica absoluta y JSON-LD válido sin calle", async ({ page }) => {
    await page.goto(PROPERTY_URL);

    for (const prop of ["og:title", "og:description", "og:url", "og:type", "og:image"]) {
      await expect(page.locator(`meta[property="${prop}"]`)).toHaveAttribute("content", /.+/);
    }
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https?:\/\//);
    expect(canonical).toMatch(new RegExp(`${PROPERTY_URL}$`));
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical!);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length).toBeGreaterThan(0);
    const parsed = blocks.map((b) => JSON.parse(b));
    const listing = parsed.flat().find((d) => d["@type"] === "RealEstateListing");
    expect(listing).toBeTruthy();
    expect(listing.name).toBe("Penthouse con terraza en Granada");
    expect(JSON.stringify(parsed)).not.toContain("streetAddress");
    expect(blocks.join("")).not.toContain("<");
  });

  test("code inexistente da 404", async ({ page }) => {
    const res = await page.goto(`${PORTAL}/propiedades/999999-no-existe`);
    expect(res?.status()).toBe(404);
    await expect(page.getByText("No encontramos esta página")).toBeVisible();
  });

  test("código no numérico da 404", async ({ page }) => {
    const res = await page.goto(`${PORTAL}/propiedades/hola`);
    expect(res?.status()).toBe(404);
  });

  test("tenant inexistente da 404 (inicio, listado y ficha)", async ({ page }) => {
    for (const path of [
      "/p/tenant-que-no-existe",
      "/p/tenant-que-no-existe/propiedades",
      "/p/tenant-que-no-existe/propiedades/9",
    ]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
      await expect(page.getByText("No encontramos esta página")).toBeVisible();
    }
  });
});

test.describe("sin scroll horizontal", () => {
  for (const [name, path] of [
    ["inicio", PORTAL],
    ["listado", `${PORTAL}/propiedades`],
    ["ficha", PROPERTY_URL],
    ["ficha sin fotos", `${PORTAL}/propiedades/8-casa-remodelada-en-ciudad-jardin`],
  ] as const) {
    test(name, async ({ page }, info) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      if (info.project.name.startsWith("mobile")) {
        expect(page.viewportSize()?.width).toBe(375);
      }
      await noHorizontalScroll(page);
    });
  }
});

test.describe("formulario de interés", () => {
  const fill = async (page: Page) => {
    await page.getByLabel("Nombre", { exact: true }).fill("Ana Pérez");
    await page.getByLabel(/Teléfono o WhatsApp/).fill("3001234567");
  };

  test("muestra errores sin consentimiento y no envía", async ({ page }) => {
    let calls = 0;
    await page.route("**/api/portal/leads", (route) => {
      calls++;
      return route.fulfill({ status: 202, json: { received: true } });
    });
    await page.goto(PROPERTY_URL);
    await fill(page);
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(/Debes autorizar el tratamiento de tus datos/)).toBeVisible();
    expect(calls).toBe(0);
  });

  test("muestra errores de campos obligatorios vacíos", async ({ page }) => {
    await page.goto(PROPERTY_URL);
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("Escribe tu nombre")).toBeVisible();
    await expect(page.getByText("Escribe un teléfono válido")).toBeVisible();
  });

  test("con datos válidos muestra éxito (API mockeada, no crea leads)", async ({ page }) => {
    const bodies: any[] = [];
    await page.route("**/api/portal/leads", (route) => {
      bodies.push(route.request().postDataJSON());
      return route.fulfill({ status: 202, json: { received: true } });
    });
    await page.goto(PROPERTY_URL);
    await fill(page);
    await page.getByLabel(/Autorizo a/).check();
    await page.getByRole("button", { name: "Enviar" }).click();

    await expect(page.getByText("¡Gracias por tu interés!")).toBeVisible();
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toMatchObject({
      slug: TENANT,
      property_code: 9,
      name: "Ana Pérez",
      consent: true,
      consent_version: "1.0",
      website: "",
    });
  });

  test("429 del servidor muestra el aviso de límite", async ({ page }) => {
    await page.route("**/api/portal/leads", (route) =>
      route.fulfill({ status: 429, json: { error: "rate_limited" } })
    );
    await page.goto(PROPERTY_URL);
    await fill(page);
    await page.getByLabel(/Autorizo a/).check();
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(/Has enviado varias solicitudes/)).toBeVisible();
  });
});
