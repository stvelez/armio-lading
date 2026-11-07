import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeProfile, makeProperty } from "./fixtures";

/**
 * `/p/{slug}` es una ruta INTERNA (destino de la reescritura del proxy) y está deprecada como
 * URL pública: ninguna URL, enlace, canónica, sitemap, JSON-LD o enlace de compartir generado
 * por el portal puede contenerla.
 */

const state = vi.hoisted(() => ({ entries: [] as unknown[] }));

vi.mock("@/portal/lib/api", () => ({
  getSitemapEntries: async () => ({ kind: "ok", data: state.entries }),
  getPortalIndex: async () => [{ slug: "inmobiliaria-demo", updated_at: "2026-01-01T00:00:00Z" }],
}));

import robotsTxt from "@/app/robots";
import rootSitemap from "@/app/sitemap";
import { GET as portalRobots } from "@/app/(portal)/p/[tenant]/robots.txt/route";
import { GET as portalSitemap } from "@/app/(portal)/p/[tenant]/sitemap.xml/route";
import PortalFooter from "@/portal/components/PortalFooter";
import PortalHeader from "@/portal/components/PortalHeader";
import PropertyCard from "@/portal/components/PropertyCard";
import ShareButtons from "@/portal/components/ShareButtons";
import { agentJsonLd, buildMetadata, propertyJsonLd } from "@/portal/lib/seo";
import { portalPath, portalUrl, propertyPath } from "@/portal/lib/urls";

const params = (tenant: string) => ({ params: Promise.resolve({ tenant }) });
const NO_P = /\/p\//;

describe.each([
  ["armio.co", "https://inmobiliaria-demo.armio.co"],
  ["localhost:3000", "http://inmobiliaria-demo.localhost:3000"],
])("ninguna URL generada contiene /p/ (raíz %s)", (root, origin) => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", root);
    state.entries = [{ code: 9, slug: "penthouse", updated_at: "2026-01-01T00:00:00Z" }];
  });

  it("helpers de URL", () => {
    for (const u of [
      portalUrl("inmobiliaria-demo"),
      portalUrl("inmobiliaria-demo", "/propiedades"),
      portalUrl("inmobiliaria-demo", propertyPath(9, "x")),
      portalPath(),
      portalPath("/privacidad"),
      propertyPath(9, "x"),
    ]) {
      expect(u).not.toMatch(NO_P);
    }
    expect(portalUrl("inmobiliaria-demo", "/propiedades")).toBe(`${origin}/propiedades`);
  });

  it("sitemap del tenant", async () => {
    const res = await portalSitemap(new Request("http://x/"), params("inmobiliaria-demo"));
    const xml = await res.text();
    expect(xml).not.toMatch(NO_P);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toContain(origin);
    expect(locs).toContain(`${origin}/propiedades/9-penthouse`);
    expect(locs.every((l) => l.startsWith(origin))).toBe(true);
  });

  it("robots del tenant", async () => {
    const res = await portalRobots(new Request("http://x/"), params("inmobiliaria-demo"));
    const body = await res.text();
    expect(body).not.toMatch(NO_P);
    expect(body).toContain("Allow: /");
    expect(body).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  it("sitemap raíz lista los subdominios", async () => {
    const urls = (await rootSitemap()).map((e) => e.url);
    expect(urls.join(" ")).not.toMatch(NO_P);
    expect(urls).toContain(origin);
  });

  it("metadata y JSON-LD", () => {
    const profile = makeProfile();
    const property = makeProperty();
    const meta = buildMetadata({
      title: "T",
      description: "D",
      url: portalUrl(profile.slug, propertyPath(property.code, property.slug)),
      siteName: "S",
    });
    const blob = JSON.stringify([
      meta,
      propertyJsonLd({ property, profile, url: portalUrl(profile.slug, "/propiedades/9-x") }),
      agentJsonLd(profile, portalUrl(profile.slug)),
    ]);
    expect(blob).not.toMatch(NO_P);
    expect(blob).toContain(`${origin}/propiedades`);
  });

  it("HTML: encabezado, pie, tarjeta y compartir solo traen enlaces del subdominio", () => {
    const profile = makeProfile();
    const html = [
      renderToStaticMarkup(createElement(PortalHeader, { profile })),
      renderToStaticMarkup(createElement(PortalFooter, { profile })),
      renderToStaticMarkup(
        createElement(PropertyCard, {
          property: {
            code: 9,
            slug: "penthouse",
            title: "T",
            purpose: { slug: "sale", name: "Venta" },
            type: { slug: "casa", name: "Casa" },
            location: {},
            images: [],
          } as never,
        })
      ),
      renderToStaticMarkup(
        createElement(ShareButtons, {
          title: "T",
          url: portalUrl("inmobiliaria-demo", "/propiedades/9-x"),
        })
      ),
    ].join("\n");
    expect(html).not.toMatch(NO_P);
    expect(html).toContain('href="/propiedades"');
    expect(html).toContain('href="/privacidad"');
    expect(html).toContain('href="/propiedades/9-penthouse"');
  });
});

describe("robots del dominio raíz", () => {
  it("no cambia", () => {
    expect(robotsTxt()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://armio.co/sitemap.xml",
    });
  });
});
