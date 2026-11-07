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
});
