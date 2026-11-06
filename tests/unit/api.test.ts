import { afterEach, describe, expect, it, vi } from "vitest";
import { getPortalIndex, loadProfile, loadProperties, loadProperty } from "@/portal/lib/api";

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function mockFetch(res: Response | (() => Response)) {
  const fn = vi.fn(async () => (typeof res === "function" ? res() : res));
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllEnvs());

describe("cliente del API del portal", () => {
  it("desenvuelve {data} y conserva meta", async () => {
    const fetchMock = mockFetch(
      respond(200, {
        success: true,
        data: [{ code: 1 }],
        meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
      })
    );
    const r = await loadProperties("t-ok", "?operacion=venta");
    expect(r).toEqual({
      kind: "ok",
      data: [{ code: 1 }],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit & { next: any }];
    expect(url).toMatch(/\/public\/portal\/t-ok\/properties\?operacion=venta$/);
    expect(init.next.tags).toContain("portal:t-ok");
  });

  it("codifica el slug en la URL", async () => {
    const fetchMock = mockFetch(respond(200, { data: { slug: "x" } }));
    await loadProfile("a/b c");
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toContain(
      "/public/portal/a%2Fb%20c"
    );
  });

  it("redirect_to -> kind redirect con el slug nuevo", async () => {
    mockFetch(respond(200, { data: { redirect_to: "slug-nuevo" } }));
    expect(await loadProfile("t-redirect")).toEqual({ kind: "redirect", slug: "slug-nuevo" });
  });

  it("404 -> notfound", async () => {
    mockFetch(respond(404, { message: "no" }));
    expect(await loadProfile("t-404")).toEqual({ kind: "notfound" });
  });

  it("400 -> notfound", async () => {
    mockFetch(respond(400, {}));
    expect(await loadProfile("t-400")).toEqual({ kind: "notfound" });
  });

  it("data ausente o nula -> notfound", async () => {
    mockFetch(respond(200, { success: true }));
    expect(await loadProfile("t-nodata")).toEqual({ kind: "notfound" });
    mockFetch(respond(200, { data: null }));
    expect(await loadProfile("t-null")).toEqual({ kind: "notfound" });
  });

  it("5xx lanza error", async () => {
    mockFetch(respond(500, {}));
    await expect(loadProperty("t-500", 1)).rejects.toThrow(/500/);
  });

  it("loadProperty usa la etiqueta de caché por propiedad", async () => {
    const fetchMock = mockFetch(respond(200, { data: { code: 7 } }));
    await loadProperty("t-tags", 7);
    const init = (fetchMock.mock.calls[0] as unknown as [string, { next: any }])[1];
    expect(init.next.tags).toEqual(["portal:t-tags", "portal:t-tags:prop:7"]);
  });
});

describe("getPortalIndex", () => {
  it("sin PORTAL_SERVER_KEY devuelve [] sin llamar al API", async () => {
    vi.stubEnv("PORTAL_SERVER_KEY", "");
    const fetchMock = mockFetch(respond(200, { data: [] }));
    expect(await getPortalIndex()).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envía x-portal-key y devuelve la lista", async () => {
    vi.stubEnv("PORTAL_SERVER_KEY", "k-secret");
    const fetchMock = mockFetch(respond(200, { data: [{ slug: "a", updated_at: "x" }] }));
    expect(await getPortalIndex()).toEqual([{ slug: "a", updated_at: "x" }]);
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>)["x-portal-key"]).toBe("k-secret");
  });

  it("devuelve [] ante fallos de red, HTTP o forma inesperada", async () => {
    vi.stubEnv("PORTAL_SERVER_KEY", "k");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("net")))
    );
    expect(await getPortalIndex()).toEqual([]);
    mockFetch(respond(500, {}));
    expect(await getPortalIndex()).toEqual([]);
    mockFetch(respond(200, { data: "nope" }));
    expect(await getPortalIndex()).toEqual([]);
  });
});
