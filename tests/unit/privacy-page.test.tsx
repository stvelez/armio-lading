import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeProfile } from "./fixtures";

vi.mock("@/portal/lib/api", () => ({
  loadProfile: vi.fn(),
  getProfile: vi.fn(async () => makeProfile()),
}));

import PrivacyPage from "@/app/(portal)/p/[tenant]/privacidad/page";

const render = async () =>
  renderToStaticMarkup(
    await PrivacyPage({ params: Promise.resolve({ tenant: "inmobiliaria-demo" }) })
  );

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
});

describe("aviso de privacidad del portal y Turnstile", () => {
  it("con site key aparece 'Seguridad del formulario' y el enlace al addendum de Cloudflare", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
    const html = await render();
    expect(html).toContain("Seguridad del formulario");
    expect(html).toContain('href="https://www.cloudflare.com/turnstile-privacy-policy/"');
    expect(html).toContain("Cloudflare Turnstile");
  });

  it("sin site key no aparece", async () => {
    const html = await render();
    expect(html).not.toContain("Seguridad del formulario");
    expect(html).not.toContain("cloudflare");
  });

  it("explica el contador de visitas, la marca técnica de sesión y el GA4 de armio.co", async () => {
    const html = await render();
    expect(html).toContain("Estadísticas de visitas");
    expect(html).toContain("se conservan hasta por 13 meses");
    expect(html).toContain("Armio realiza este conteo como Encargado del tratamiento");
    expect(html).toContain("dirección IP (o su prefijo de red)");
    expect(html).toContain(
      "solo en la memoria del servidor durante el día en curso (como máximo hasta la medianoche, hora de Colombia)"
    );
    expect(html).toContain("clave aleatoria que se descarta cada día");
    expect(html).toContain("no se guarda en ninguna base de datos");
    expect(html).not.toContain("unos minutos");
    // El portal no tiene analítica de terceros; eso se sigue afirmando…
    expect(html).toContain("ni herramientas de analítica de");
    expect(html).toContain("no hay Google Analytics");
    // …pero ya no se niega TODO almacenamiento: VisitBeacon escribe sessionStorage["armio:equipo"].
    expect(html).toContain("armio:equipo");
    expect(html).not.toContain("ni almacenamiento en tu navegador");
    // Y se declara el GA4 del sitio de marketing, con enlace a la política de cookies.
    expect(html).toContain("Google Analytics 4");
    expect(html).toContain('href="https://armio.co/cookies"');
  });

  it("la sección de visitas va después de 'Datos que recolectamos' y antes de 'Finalidades'", async () => {
    const html = await render();
    const order = ["Datos que recolectamos", "Estadísticas de visitas", "Finalidades"].map((t) =>
      html.indexOf(`<h2>${t}</h2>`)
    );
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
