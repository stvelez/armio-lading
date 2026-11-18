import { describe, expect, it, vi } from "vitest";
import robotsTxt from "@/app/robots";
import { isProductionDeployment } from "@/lib/deployment-env";
import { SITEMAP_URL, siteRobots, siteRobotsMetadata } from "@/lib/robots";

describe("isProductionDeployment", () => {
  it("solo Vercel producción indexa", () => {
    expect(isProductionDeployment({ VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionDeployment({ NEXT_PUBLIC_VERCEL_ENV: "production" })).toBe(true);
    // `VERCEL_ENV` manda cuando existe.
    expect(
      isProductionDeployment({ VERCEL_ENV: "preview", NEXT_PUBLIC_VERCEL_ENV: "production" })
    ).toBe(false);
  });

  it("preview, development, tests y local no indexan (fallback seguro)", () => {
    expect(isProductionDeployment({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isProductionDeployment({ VERCEL_ENV: "development" })).toBe(false);
    expect(isProductionDeployment({})).toBe(false);
    // Un build local con NODE_ENV=production tampoco se indexa: falta VERCEL_ENV.
    expect(isProductionDeployment({ NODE_ENV: "production" })).toBe(false);
  });
});

describe("robots del sitio", () => {
  it("producción permite rastrear y conserva el sitemap", () => {
    expect(siteRobots(true)).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: SITEMAP_URL,
    });
    expect(siteRobotsMetadata(true)).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    });
  });

  it("preview/local bloquea todo y omite el sitemap", () => {
    const robots = siteRobots(false);
    expect(robots).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    expect(robots).not.toHaveProperty("sitemap");
    expect(siteRobotsMetadata(false)).toEqual({ index: false, follow: false });
  });

  it("la ruta /robots.txt sigue el entorno del build", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(robotsTxt()).toEqual({ rules: { userAgent: "*", disallow: "/" } });

    vi.stubEnv("VERCEL_ENV", "production");
    expect(robotsTxt()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: SITEMAP_URL,
    });
  });
});
