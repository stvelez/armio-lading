import { expect, test, type Page } from "@playwright/test";

/**
 * E2E del portal público. Requiere el API local en http://localhost:4000 con el tenant
 * `inmobiliaria-demo` (6 propiedades públicas; code 9 'both' con 2 fotos; varias sin fotos).
 */

const TENANT = "inmobiliaria-demo";
const ROOT = "localhost:3000";
const ORIGIN = `http://${TENANT}.${ROOT}`; // = baseURL de playwright.config.ts
const PORTAL = ""; // las rutas del portal cuelgan de la raíz del subdominio
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
    const res = await page.goto("/");
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
      /^http:\/\/inmobiliaria-demo\.localhost:3000\/propiedades\?operacion=venta$/
    );
  });
});

test.describe("ficha de propiedad", () => {
  test("/propiedades/9 redirige 308 a la URL canónica", async ({ request, page }) => {
    const res = await request.get(`${PORTAL}/propiedades/9`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    // Canonicalización dentro del mismo subdominio: Location sin /p/{slug}
    expect(res.headers()["location"]).toBe(PROPERTY_URL);

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
    expect(canonical).toBe(`${ORIGIN}${PROPERTY_URL}`);
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
    for (const path of ["/", "/propiedades", "/propiedades/9"]) {
      const res = await page.goto(`http://tenant-que-no-existe.${ROOT}${path}`);
      expect(res?.status(), path).toBe(404);
      await expect(page.getByText("No encontramos esta página")).toBeVisible();
    }
  });
});

test.describe("sin scroll horizontal", () => {
  for (const [name, path] of [
    ["inicio", "/"],
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

  test("sin site key no se contacta a Cloudflare ni se envía turnstile_token", async ({ page }) => {
    const cloudflare: string[] = [];
    page.on("request", (req) => {
      if (/challenges\.cloudflare\.com/.test(req.url())) cloudflare.push(req.url());
    });
    const bodies: any[] = [];
    await page.route("**/api/portal/leads", (route) => {
      bodies.push(route.request().postDataJSON());
      return route.fulfill({ status: 202, json: { received: true } });
    });
    await page.goto(PROPERTY_URL);
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Nombre", { exact: true }).focus();
    await fill(page);
    await page.getByLabel(/Autorizo a/).check();
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("¡Gracias por tu interés!")).toBeVisible();
    expect(cloudflare).toHaveLength(0);
    expect(bodies).toHaveLength(1);
    expect(bodies[0].turnstile_token).toBeUndefined();
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

test.describe("subdominio del portal", () => {
  test("el inicio trae canónica y og:url del subdominio, sin /p/", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", ORIGIN);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", ORIGIN);
    expect(await page.content()).not.toContain("/p/inmobiliaria-demo");
  });

  test("los enlaces internos son relativos a la raíz del subdominio", async ({ page }) => {
    await page.goto("/propiedades");
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    const internal = hrefs.filter((h) => h.startsWith("/"));
    expect(internal).toContain("/propiedades");
    expect(internal).toContain("/privacidad");
    expect(internal.some((h) => /^\/propiedades\/\d+-/.test(h))).toBe(true);
    expect(hrefs.filter((h) => h.includes("/p/"))).toEqual([]);
  });

  test("/propiedades?operacion=venta muestra 5", async ({ page }) => {
    await page.goto("/propiedades?operacion=venta");
    await expect(page.getByText("5 propiedades", { exact: true })).toBeVisible();
  });

  test("sitemap.xml del subdominio lista URLs del subdominio", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThanOrEqual(8);
    expect(locs.every((l) => l.startsWith(`${ORIGIN}`))).toBe(true);
    expect(xml).not.toContain("/p/");
    expect(locs).toContain(`${ORIGIN}/propiedades`);
  });

  test("robots.txt del subdominio permite todo y apunta al sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Allow: /");
    expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  });

  test("/api/portal/leads responde desde el subdominio y desde la raíz", async ({ request }) => {
    for (const base of [ORIGIN, `http://${ROOT}`]) {
      const res = await request.post(`${base}/api/portal/leads`, { data: { nada: true } });
      expect(res.status(), base).toBe(400); // validación propia de la ruta: existe
    }
  });
});

test.describe("dominio raíz y hosts reservados", () => {
  test("/p/{slug}/... en la raíz responde 301 al subdominio", async ({ request }) => {
    const res = await request.get(`http://${ROOT}/p/${TENANT}/propiedades?operacion=venta`, {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(301);
    expect(res.headers()["location"]).toBe(`${ORIGIN}/propiedades?operacion=venta`);
  });

  test("el navegador termina en el subdominio y el portal carga", async ({ page }) => {
    await page.goto(`http://${ROOT}/p/${TENANT}/propiedades`);
    await expect(page).toHaveURL(`${ORIGIN}/propiedades`);
    await expect(page.getByText("6 propiedades", { exact: true })).toBeVisible();
  });

  test("localhost y www.localhost siguen sirviendo marketing", async ({ request }) => {
    for (const host of [ROOT, `www.${ROOT}`]) {
      const res = await request.get(`http://${host}/`);
      expect(res.status(), host).toBe(200);
      const html = await res.text();
      expect(html, host).toMatch(/Armio/);
      expect(html, host).not.toContain("Portal inmobiliario");
    }
  });

  test("un subdominio reservado no sirve el portal", async ({ request }) => {
    for (const host of ["admin", "app", "api"]) {
      const res = await request.get(`http://${host}.${ROOT}/propiedades`);
      expect(res.status(), host).toBe(404);
    }
    const home = await request.get(`http://admin.${ROOT}/`);
    expect(await home.text()).not.toContain("Inmobiliaria Demo");
  });
});

test.describe("contador de visitas (beacon)", () => {
  type Beacon = Record<string, unknown>;

  // Playwright marca `navigator.webdriver = true` y el contador (a propósito) no cuenta a los navegadores automatizados:
  // aquí se simula un navegador normal para poder observar los beacons.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false });
    });
  });

  /** Intercepta la ruta del contador (el API no recibe nada) y devuelve la lista de cuerpos enviados. */
  async function captureBeacons(
    page: Page,
    respond: (route: import("@playwright/test").Route) => Promise<void> = (route) =>
      route.fulfill({ status: 204 })
  ) {
    const beacons: Beacon[] = [];
    await page.route("**/api/portal/visits", (route) => {
      beacons.push(JSON.parse(route.request().postData() ?? "{}") as Beacon);
      return respond(route);
    });
    return beacons;
  }

  test("el inicio cuenta una vista 'home' directa y entrar a una ficha cuenta otra 'interno'", async ({
    page,
  }) => {
    const beacons = await captureBeacons(page);
    await page.goto("/");
    await expect.poll(() => beacons.length).toBe(1);
    expect(beacons[0]).toEqual({ page: "home", source: "directo" });

    // Navegación del lado del cliente a la ficha del código 9
    await page.goto(`${PORTAL}/propiedades`);
    await expect.poll(() => beacons.length).toBe(2);
    expect(beacons[1]).toEqual({ page: "listing", source: "directo" });
    beacons.length = 0;
    await page.locator("h3 a[href*='/propiedades/9-']").first().click();
    await expect(page).toHaveURL(new RegExp(`${PROPERTY_URL}$`));
    await expect.poll(() => beacons.length).toBe(1);
    expect(beacons[0]).toEqual({ page: "property", code: 9, source: "interno" });
    // Sin envíos de más (recargas del router, StrictMode…)
    await page.waitForTimeout(500);
    expect(beacons).toHaveLength(1);
  });

  test("pasar el ratón por las tarjetas (prefetch) sin hacer clic no cuenta fichas", async ({
    page,
  }) => {
    const beacons = await captureBeacons(page);
    await page.goto(`${PORTAL}/propiedades`);
    await expect.poll(() => beacons.length).toBe(1);
    const cards = page.locator("h3 a[href*='/propiedades/']");
    const count = await cards.count();
    for (let i = 0; i < count; i++) await cards.nth(i).hover();
    await page.waitForTimeout(800);
    expect(beacons.filter((b) => b.page === "property")).toHaveLength(0);
    expect(beacons).toHaveLength(1);
  });

  test("cambiar los filtros del listado no cuenta vistas nuevas", async ({ page }) => {
    const beacons = await captureBeacons(page);
    await page.goto(`${PORTAL}/propiedades`);
    await expect.poll(() => beacons.length).toBe(1);

    const filters = await openFilters(page);
    await filters.getByLabel("Operación").selectOption("venta");
    await filters.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/propiedades\?operacion=venta$/);
    await expect(page.getByText("5 propiedades", { exact: true })).toBeVisible();
    await page.waitForTimeout(500);
    expect(beacons).toHaveLength(1);
  });

  test("#equipo-armio no cuenta y deja la URL sin hash", async ({ page }) => {
    const beacons = await captureBeacons(page);
    await page.goto(`${PROPERTY_URL}#equipo-armio`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.poll(() => new URL(page.url()).hash).toBe("");
    // Otra página de la misma pestaña tampoco cuenta
    await page.goto(`${PORTAL}/propiedades`);
    await page.waitForTimeout(800);
    expect(beacons).toHaveLength(0);
  });

  test("la página nunca muestra error si la ruta del contador responde 500", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const beacons = await captureBeacons(page, (route) =>
      route.fulfill({ status: 500, body: "boom" })
    );
    await page.goto(PROPERTY_URL);
    await expect.poll(() => beacons.length).toBe(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Penthouse con terraza en Granada"
    );
    await expect(
      page.getByText(/Application error|Algo salió mal|No encontramos esta página/i)
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("la página no se afecta si la ruta del contador tarda 10 s", async ({ page }) => {
    const beacons = await captureBeacons(page, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      await route.fulfill({ status: 204 }).catch(() => {});
    });
    const started = Date.now();
    await page.goto(PROPERTY_URL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "Ampliar foto 1 de 2" }).click();
    await expect(page.getByRole("dialog", { name: /Galería de/ })).toBeVisible();
    expect(Date.now() - started).toBeLessThan(9_000);
    await expect.poll(() => beacons.length).toBe(1);
  });
});

test.describe("contador de visitas: navegador automatizado", () => {
  test("con navigator.webdriver activo no envía nada", async ({ page }) => {
    let calls = 0;
    await page.route("**/api/portal/visits", (route) => {
      calls++;
      return route.fulfill({ status: 204 });
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(800);
    expect(calls).toBe(0);
  });
});
