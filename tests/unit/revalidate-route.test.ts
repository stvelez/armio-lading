import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag: (...args: unknown[]) => revalidateTag(...args) }));

import * as route from "@/app/api/portal/revalidate/route";

const SECRET = "x".repeat(40);

function req(body: unknown, headers: Record<string, string> = {}, raw?: string) {
  return new NextRequest("http://localhost:3000/api/portal/revalidate", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: raw ?? JSON.stringify(body),
  });
}
const auth = { authorization: `Bearer ${SECRET}` };

beforeEach(() => {
  revalidateTag.mockReset();
  vi.stubEnv("PORTAL_REVALIDATE_SECRET", SECRET);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("POST /api/portal/revalidate", () => {
  it("sin variable de entorno: 503 y no revalida", async () => {
    vi.stubEnv("PORTAL_REVALIDATE_SECRET", "");
    const res = await route.POST(req({ tags: ["portal:a"] }, auth));
    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("sin cabecera o con secreto incorrecto: 401 sin revalidar", async () => {
    expect((await route.POST(req({ tags: ["portal:a"] }))).status).toBe(401);
    expect(
      (await route.POST(req({ tags: ["portal:a"] }, { authorization: "Bearer mal" }))).status
    ).toBe(401);
    expect((await route.POST(req({ tags: ["portal:a"] }, { authorization: SECRET }))).status).toBe(
      401
    );
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("cuerpo de más de 4 KB: 413", async () => {
    const res = await route.POST(
      req(null, auth, JSON.stringify({ tags: ["portal:a"], pad: "y".repeat(5000) }))
    );
    expect(res.status).toBe(413);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("JSON inválido, demasiadas etiquetas o una etiqueta mala: 400 sin ninguna llamada", async () => {
    expect((await route.POST(req(null, auth, "no-json"))).status).toBe(400);
    const many = Array.from({ length: 51 }, (_, i) => `portal:a:prop:${i + 1}`);
    expect((await route.POST(req({ tags: many }, auth))).status).toBe(400);
    expect((await route.POST(req({ tags: ["portal:a", "posts"] }, auth))).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("etiquetas válidas: una llamada por etiqueta única con expire 0 y no-store", async () => {
    const res = await route.POST(
      req({ tags: ["portal:a", "portal:a", "portal:a:prop:3", "portal:index"] }, auth)
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ revalidated: 3 });
    expect(revalidateTag).toHaveBeenCalledTimes(3);
    expect(revalidateTag).toHaveBeenCalledWith("portal:a", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("portal:a:prop:3", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("portal:index", { expire: 0 });
  });

  it("no registra las etiquetas (llevan el slug de la agencia)", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await route.POST(req({ tags: ["portal:agencia-secreta"] }, auth));
    expect(JSON.stringify(info.mock.calls)).not.toContain("agencia-secreta");
  });

  it("solo exporta POST (GET no existe)", () => {
    expect("GET" in route).toBe(false);
  });
});
