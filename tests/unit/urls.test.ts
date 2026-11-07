import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isLocalRoot,
  portalOrigin,
  portalPath,
  portalRootDomain,
  portalUrl,
  propertyPath,
} from "@/portal/lib/urls";

afterEach(() => vi.unstubAllEnvs());

describe("portalOrigin / portalUrl", () => {
  it("por defecto usa https://{slug}.armio.co", () => {
    vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", "");
    expect(portalRootDomain()).toBe("armio.co");
    expect(portalOrigin("torres")).toBe("https://torres.armio.co");
    expect(portalUrl("torres")).toBe("https://torres.armio.co");
    expect(portalUrl("torres", "/propiedades?operacion=venta")).toBe(
      "https://torres.armio.co/propiedades?operacion=venta"
    );
  });

  it("en local (localhost:3000) usa http y conserva el puerto", () => {
    vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", "localhost:3000");
    expect(isLocalRoot()).toBe(true);
    expect(portalOrigin("torres")).toBe("http://torres.localhost:3000");
    expect(portalUrl("torres", "/privacidad")).toBe("http://torres.localhost:3000/privacidad");
  });

  it("un dominio propio real sigue en https", () => {
    vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", "staging.armio.co");
    expect(portalOrigin("torres")).toBe("https://torres.staging.armio.co");
  });
});

describe("rutas relativas al subdominio", () => {
  it("no incluyen /p/ ni el slug", () => {
    expect(portalPath()).toBe("/");
    expect(portalPath("/propiedades")).toBe("/propiedades");
    expect(propertyPath(9, "penthouse")).toBe("/propiedades/9-penthouse");
  });
});
