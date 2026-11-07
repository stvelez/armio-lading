import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { config, proxy } from "@/proxy";

const req = (url: string, host?: string, headers: Record<string, string> = {}) =>
  new NextRequest(url, { headers: { ...(host ? { host } : {}), ...headers } });

describe("proxy con raíz armio.co", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", "armio.co"));

  it("reescribe {slug}.armio.co/x a /p/{slug}/x conservando la query", () => {
    const res = proxy(
      req("https://torres.armio.co/propiedades?operacion=venta&page=2", "torres.armio.co")
    );
    expect(res.headers.get("x-middleware-rewrite")).toBe(
      "https://torres.armio.co/p/torres/propiedades?operacion=venta&page=2"
    );
    expect(res.status).toBe(200);
  });

  it("la raíz del subdominio va a /p/{slug}", () => {
    const res = proxy(req("https://torres.armio.co/", "torres.armio.co"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://torres.armio.co/p/torres");
  });

  it("sitemap.xml y robots.txt del subdominio se reescriben al tenant", () => {
    for (const f of ["sitemap.xml", "robots.txt"]) {
      const res = proxy(req(`https://torres.armio.co/${f}`, "torres.armio.co"));
      expect(res.headers.get("x-middleware-rewrite")).toBe(`https://torres.armio.co/p/torres/${f}`);
    }
  });

  it("usa x-forwarded-host con prioridad sobre host", () => {
    const res = proxy(
      req("https://armio.co/propiedades", "armio.co", { "x-forwarded-host": "torres.armio.co" })
    );
    expect(res.headers.get("x-middleware-rewrite")).toContain("/p/torres/propiedades");
  });

  it("/api/portal/* en el subdominio NO se reescribe (la ruta existe fuera de /p)", () => {
    const res = proxy(req("https://torres.armio.co/api/portal/leads", "torres.armio.co"));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("/api/portal/revalidate pasa sin reescribirse, en subdominio y en la raíz", () => {
    for (const [url, host] of [
      ["https://torres.armio.co/api/portal/revalidate", "torres.armio.co"],
      ["https://armio.co/api/portal/revalidate", "armio.co"],
    ]) {
      const res = proxy(req(url, host));
      expect(res.headers.get("x-middleware-rewrite"), url).toBeNull();
      expect(res.headers.get("x-middleware-next"), url).toBe("1");
    }
  });

  it("no reescribe dos veces: /p/... en un subdominio redirige 301 al subdominio indicado", () => {
    const res = proxy(req("https://torres.armio.co/p/torres/propiedades?x=1", "torres.armio.co"));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://torres.armio.co/propiedades?x=1");
  });

  it.each([
    "www.armio.co",
    "app.armio.co",
    "admin.armio.co",
    "api.armio.co",
    "ab.armio.co",
    "armio.co",
    "x.vercel.app",
  ])("%s sirve lo suyo sin reescribir", (host) => {
    const res = proxy(req(`https://${host}/propiedades`, host));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("301 de armio.co/p/{slug} al subdominio", () => {
    const res = proxy(req("https://armio.co/p/torres", "armio.co"));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://torres.armio.co/");
  });

  it("301 conserva ruta y query, y normaliza mayúsculas del slug", () => {
    const res = proxy(req("https://armio.co/p/Torres/propiedades/9-x?operacion=venta", "armio.co"));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      "https://torres.armio.co/propiedades/9-x?operacion=venta"
    );
  });

  it("www.armio.co/p/{slug} también redirige", () => {
    const res = proxy(req("https://www.armio.co/p/torres/privacidad", "www.armio.co"));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://torres.armio.co/privacidad");
  });

  it("/p/{slug} con slug reservado o inválido en la raíz no redirige", () => {
    for (const p of ["/p/admin", "/p/ab", "/p/a--b/x", "/p"]) {
      const res = proxy(req(`https://armio.co${p}`, "armio.co"));
      expect(res.status, p).toBe(200);
      expect(res.headers.get("location"), p).toBeNull();
    }
  });

  it("no hace bucle: seguir el 301 llega a una reescritura, no a otro redirect", () => {
    const first = proxy(req("https://armio.co/p/torres/propiedades?a=1", "armio.co"));
    const next = new URL(first.headers.get("location")!);
    const second = proxy(req(next.toString(), next.host));
    expect(second.status).toBe(200);
    expect(second.headers.get("location")).toBeNull();
    expect(second.headers.get("x-middleware-rewrite")).toBe(
      "https://torres.armio.co/p/torres/propiedades?a=1"
    );
  });
});

describe("proxy en local (raíz localhost:3000)", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", "localhost:3000"));

  it("torres.localhost:3000 se reescribe", () => {
    const res = proxy(req("http://torres.localhost:3000/propiedades", "torres.localhost:3000"));
    expect(res.headers.get("x-middleware-rewrite")).toBe(
      "http://torres.localhost:3000/p/torres/propiedades"
    );
  });

  it("localhost:3000/p/{slug}/... redirige 301 a http://{slug}.localhost:3000/...", () => {
    const res = proxy(req("http://localhost:3000/p/torres/propiedades?a=1", "localhost:3000"));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("http://torres.localhost:3000/propiedades?a=1");
  });

  it.each(["localhost:3000", "www.localhost:3000", "admin.localhost:3000"])(
    "%s no se reescribe",
    (host) => {
      const res = proxy(req(`http://${host}/`, host));
      expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    }
  );
});

describe("matcher", () => {
  it("excluye _next/static, _next/image y archivos estáticos, pero no sitemap/robots", () => {
    const source = config.matcher[0];
    const re = new RegExp(`^${source}$`);
    for (const p of [
      "/_next/static/a.js",
      "/_next/image",
      "/favicon.ico",
      "/logo.png",
      "/fonts/a.woff2",
    ]) {
      expect(re.test(p), p).toBe(false);
    }
    for (const p of [
      "/",
      "/propiedades",
      "/sitemap.xml",
      "/robots.txt",
      "/api/portal/leads",
      "/p/torres",
    ]) {
      expect(re.test(p), p).toBe(true);
    }
  });
});
