import { describe, expect, it } from "vitest";
import { isAllowedPortalTag, portalTag, propertyTag, PORTAL_INDEX_TAG } from "@/portal/lib/tags";
import { parseRevalidateBody, secretMatches } from "@/portal/lib/revalidate";

describe("etiquetas del portal", () => {
  it("arma las mismas cadenas que usa el API", () => {
    expect(portalTag("mi-agencia")).toBe("portal:mi-agencia");
    expect(propertyTag("mi-agencia", 12)).toBe("portal:mi-agencia:prop:12");
    expect(PORTAL_INDEX_TAG).toBe("portal:index");
  });

  it("acepta índice, tenant y propiedad", () => {
    for (const tag of [
      "portal:index",
      "portal:abc",
      "portal:mi-agencia",
      "portal:mi-agencia:prop:12",
    ]) {
      expect(isAllowedPortalTag(tag), tag).toBe(true);
    }
  });

  it("rechaza todo lo demás", () => {
    for (const tag of [
      "portal:ABC",
      "portal:a b",
      "portal:abc:prop:0",
      "portal:abc:prop:1234567890",
      "portal:abc:prop:x",
      "portal:",
      "portal:index:prop:1",
      "_N_T_/layout",
      "posts",
      "",
      `portal:${"a".repeat(300)}`,
    ]) {
      expect(isAllowedPortalTag(tag), tag).toBe(false);
    }
  });
});

describe("secretMatches", () => {
  it("compara en tiempo constante, también con distinto largo", () => {
    expect(secretMatches("s3cret", "s3cret")).toBe(true);
    expect(secretMatches("otro", "s3cret")).toBe(false);
    expect(secretMatches("s3cret-largo", "s3cret")).toBe(false);
    expect(secretMatches(null, "s3cret")).toBe(false);
    expect(secretMatches("s3cret", undefined)).toBe(false);
  });
});

describe("parseRevalidateBody", () => {
  it("deduplica etiquetas válidas", () => {
    expect(
      parseRevalidateBody(JSON.stringify({ tags: ["portal:a", "portal:a", "portal:index"] }))
    ).toEqual(["portal:a", "portal:index"]);
  });

  it("es todo o nada", () => {
    expect(parseRevalidateBody(JSON.stringify({ tags: ["portal:a", "posts"] }))).toBeNull();
    expect(parseRevalidateBody("no es json")).toBeNull();
    expect(parseRevalidateBody(JSON.stringify({ tags: [] }))).toBeNull();
    expect(parseRevalidateBody(JSON.stringify({ tags: ["portal:a"], extra: 1 }))).toBeNull();
    expect(
      parseRevalidateBody(
        JSON.stringify({ tags: Array.from({ length: 51 }, (_, i) => `portal:a:prop:${i + 1}`) })
      )
    ).toBeNull();
  });
});
