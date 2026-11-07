import { describe, expect, it } from "vitest";
import { classifyHost, extractPortalSlug, isValidPortalSlug } from "@/portal/lib/host";
import { RESERVED_SLUGS } from "@/portal/lib/reserved-slugs";

describe("extractPortalSlug", () => {
  it.each([
    ["torres.armio.co", "armio.co", "torres"],
    ["torres.armio.co:443", "armio.co", "torres"],
    ["TORRES.Armio.CO", "armio.co", "torres"],
    ["torres.localhost:3000", "localhost:3000", "torres"],
    ["torres.localhost", "localhost:3000", "torres"],
    ["inmobiliaria-demo.localhost:3000", "localhost:3000", "inmobiliaria-demo"],
    ["torres.armio.co.", "armio.co", "torres"],
    ["abc.armio.co", "armio.co", "abc"],
  ])("%s (raíz %s) -> %s", (host, root, slug) => {
    expect(extractPortalSlug(host, root)).toBe(slug);
  });

  it.each([
    ["armio.co", "armio.co"],
    ["www.armio.co", "armio.co"],
    ["localhost:3000", "localhost:3000"],
    ["www.localhost:3000", "localhost:3000"],
    ["admin.localhost:3000", "localhost:3000"],
    ["app.armio.co", "armio.co"],
    ["api.armio.co", "armio.co"],
    ["ab.armio.co", "armio.co"], // < 3 caracteres
    [`${"a".repeat(31)}.armio.co`, "armio.co"], // > 30
    ["-torres.armio.co", "armio.co"],
    ["torres-.armio.co", "armio.co"],
    ["to--rres.armio.co", "armio.co"],
    ["to_rres.armio.co", "armio.co"],
    ["a.b.armio.co", "armio.co"], // dos niveles
    ["torres.otro.com", "armio.co"],
    ["torres.armio.co.evil.com", "armio.co"],
    ["evilarmio.co", "armio.co"],
    ["", "armio.co"],
    [null, "armio.co"],
    [undefined, "armio.co"],
  ])("%s (raíz %s) -> sin portal", (host, root) => {
    expect(extractPortalSlug(host, root)).toBeNull();
  });

  it("ningún slug reservado se reescribe", () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(extractPortalSlug(`${reserved}.armio.co`, "armio.co"), reserved).toBeNull();
    }
  });

  it("la lista reservada incluye los nombres mínimos exigidos", () => {
    for (const s of [
      "www",
      "app",
      "api",
      "admin",
      "operator",
      "media",
      "mail",
      "static",
      "p",
      "login",
      "soporte",
      "blog",
      "send",
      "autoconfig",
      "autodiscover",
      "stage-app",
    ]) {
      expect(RESERVED_SLUGS.has(s), s).toBe(true);
    }
  });
});

describe("classifyHost", () => {
  it("distingue raíz, otro subdominio, portal y ajeno", () => {
    expect(classifyHost("armio.co", "armio.co")).toEqual({ kind: "root" });
    expect(classifyHost("www.armio.co", "armio.co")).toEqual({
      kind: "other-subdomain",
      label: "www",
    });
    expect(classifyHost("torres.armio.co", "armio.co")).toEqual({ kind: "portal", slug: "torres" });
    expect(classifyHost("x.vercel.app", "armio.co")).toEqual({ kind: "foreign" });
  });
});

describe("isValidPortalSlug", () => {
  it.each(["abc", "a-b", "inmobiliaria-demo", "a1b2", "a".repeat(30)])("acepta %s", (s) => {
    expect(isValidPortalSlug(s)).toBe(true);
  });
  it.each(["ab", "a".repeat(31), "A-b", "a--b", "-ab", "ab-", "a b", "a.b", ""])(
    "rechaza %j",
    (s) => {
      expect(isValidPortalSlug(s)).toBe(false);
    }
  );
});
