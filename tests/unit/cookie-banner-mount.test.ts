import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guardia estática: el aviso de cookies debe montarse en los LAYOUTS. Cuando vivía dentro del
 * Footer solo aparecía en `/` (el único sitio que importa el Footer) y faltaba, entre otras, en
 * `/cookies`.
 */

const read = (p: string) => readFileSync(path.resolve(__dirname, "../../src", p), "utf8");

describe("el aviso se monta en los layouts, no en una página", () => {
  it("el layout de marketing monta el aviso de consentimiento", () => {
    expect(read("app/(marketing)/layout.tsx")).toContain("<CookieConsentBanner />");
  });

  it("el layout del portal monta la variante informativa", () => {
    expect(read("app/(portal)/p/[tenant]/layout.tsx")).toContain(
      '<CookieConsentBanner variant="notice" />'
    );
  });

  it("el Footer de marketing ya no contiene la lógica de consentimiento", () => {
    const footer = read("components/layout/Footer.tsx");
    expect(footer).not.toMatch(/setConsent|subscribeConsent|@\/lib\/consent/);
  });
});
