import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/portal/visits/route";

const KEY = "super-secret-portal-key";
const CHROME =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

const valid = {
  page: "property",
  code: 9,
  source: "whatsapp",
  utm_source: "whatsapp",
  utm_medium: "compartir",
};

function req(
  body: unknown,
  headers: Record<string, string | null> = {},
  { raw, host = "inmobiliaria-demo.armio.co" }: { raw?: string; host?: string } = {}
) {
  const h: Record<string, string> = {
    "content-type": "text/plain;charset=UTF-8",
    host,
    "user-agent": CHROME,
    "x-forwarded-for": "203.0.113.7, 10.0.0.1",
    "sec-fetch-site": "same-origin",
  };
  for (const [k, v] of Object.entries(headers)) {
    if (v === null) delete h[k];
    else h[k] = v;
  }
  return new NextRequest(`https://${host}/api/portal/visits`, {
    method: "POST",
    headers: h,
    body: raw ?? JSON.stringify(body),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;
const upstream = (status = 204) => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ secret: KEY }), { status }));
  vi.stubGlobal("fetch", fetchMock);
};
const sentInit = () => (fetchMock.mock.calls[0] as any)[1];
const sentBody = () => JSON.parse(sentInit().body);

async function expectNoContent(res: Response) {
  expect(res.status).toBe(204);
  expect(await res.text()).toBe("");
  expect(res.headers.get("cache-control")).toBe("no-store");
}

beforeEach(() => {
  vi.stubEnv("PORTAL_SERVER_KEY", KEY);
  vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", "armio.co");
  upstream();
});

describe("POST /api/portal/visits", () => {
  it("reenvía al API con llave, primera IP de x-forwarded-for, UA y property_code; el slug sale del host", async () => {
    const res = await POST(req(valid));
    await expectNoContent(res);

    const [url, init] = fetchMock.mock.calls[0] as any;
    expect(url).toMatch(/\/public\/portal\/inmobiliaria-demo\/visits$/);
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("no-store");
    expect(init.headers["x-portal-key"]).toBe(KEY);
    expect(init.headers["x-portal-client-ip"]).toBe("203.0.113.7");
    expect(init.headers["User-Agent"]).toBe(CHROME);
    expect(sentBody()).toEqual({
      page: "property",
      property_code: 9,
      source: "whatsapp",
      utm_source: "whatsapp",
      utm_medium: "compartir",
    });
    expect(sentBody().slug).toBeUndefined();
  });

  it("el slug sale del host aunque el cuerpo traiga otro; x-forwarded-host tiene prioridad", async () => {
    await POST(req({ ...valid, slug: "otra-agencia" }, { "x-forwarded-host": "torres.armio.co" }));
    expect((fetchMock.mock.calls[0] as any)[0]).toMatch(/\/public\/portal\/torres\/visits$/);
    expect(sentBody().slug).toBeUndefined();
  });

  it("en local (*.localhost:3000)", async () => {
    vi.stubEnv("NEXT_PUBLIC_PORTAL_ROOT_DOMAIN", "localhost:3000");
    await POST(req({ page: "home", source: "directo" }, {}, { host: "demo.localhost:3000" }));
    expect((fetchMock.mock.calls[0] as any)[0]).toMatch(/\/public\/portal\/demo\/visits$/);
    expect(sentBody()).toEqual({ page: "home", source: "directo" });
  });

  it("recorta el UA a 255 caracteres", async () => {
    await POST(req(valid, { "user-agent": "Mozilla/5.0 " + "x".repeat(400) }));
    expect(sentInit().headers["User-Agent"]).toHaveLength(255);
  });

  it("descarta campos desconocidos antes de reenviar", async () => {
    await POST(req({ ...valid, admin: true, referrer: "https://x.co", url: "https://y.co/z" }));
    const body = sentBody();
    expect(body.admin).toBeUndefined();
    expect(body.referrer).toBeUndefined();
    expect(body.url).toBeUndefined();
  });

  it("acepta home y listing sin code", async () => {
    await POST(req({ page: "listing", source: "buscador" }));
    expect(sentBody()).toEqual({ page: "listing", source: "buscador" });
  });

  describe("siempre 204 y sin llamar al API", () => {
    const bad: Record<string, unknown> = {
      "page inválida": { ...valid, page: "privacidad" },
      "source inválida": { ...valid, source: "tiktok" },
      "ficha sin code": { page: "property", source: "directo" },
      "code en inicio": { page: "home", code: 9, source: "directo" },
      "code 0": { ...valid, code: 0 },
      "code decimal": { ...valid, code: 1.5 },
      "code gigante": { ...valid, code: 1_000_000_000 },
      "code como texto": { ...valid, code: "9" },
      "utm con @": { ...valid, utm_source: "a@b.com" },
      "utm de 41": { ...valid, utm_campaign: "a".repeat(41) },
      "cuerpo null": null,
      "cuerpo array": [valid],
      "cuerpo string": "hola",
    };
    it.each(Object.entries(bad))("%s", async (_n, body) => {
      await expectNoContent(await POST(req(body)));
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("JSON malformado", async () => {
      await expectNoContent(await POST(req(null, {}, { raw: "{no es json" })));
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("cuerpo mayor de 1 KB", async () => {
      await expectNoContent(await POST(req({ ...valid, relleno: "x".repeat(1100) })));
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("host raíz, foráneo, subdominio no portal o ausente", async () => {
      for (const host of ["armio.co", "preview-abc.vercel.app", "www.armio.co", "app.armio.co"]) {
        await expectNoContent(await POST(req(valid, {}, { host })));
      }
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ["Sec-Fetch-Site cross-site", { "sec-fetch-site": "cross-site" }],
      ["Sec-Fetch-Site same-site", { "sec-fetch-site": "same-site" }],
      ["Sec-Fetch-Site none", { "sec-fetch-site": "none" }],
      ["next-router-prefetch", { "next-router-prefetch": "1" }],
      ["purpose: prefetch", { purpose: "prefetch" }],
      ["sec-purpose: prefetch", { "sec-purpose": "prefetch;prerender" }],
      ["UA bot", { "user-agent": "Googlebot/2.1" }],
      ["UA WhatsApp (previsualización)", { "user-agent": "WhatsApp/2.23.20.0 A" }],
      ["UA vacío", { "user-agent": "" }],
      ["UA ausente", { "user-agent": null }],
      ["sin IP válida", { "x-forwarded-for": "no-es-ip; drop table" }],
    ])("%s", async (_n, headers) => {
      await expectNoContent(await POST(req(valid, headers as Record<string, string | null>)));
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("sin Sec-Fetch-Site (navegadores viejos) sí reenvía", async () => {
      await POST(req(valid, { "sec-fetch-site": null }));
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("sin PORTAL_SERVER_KEY (no llama a fetch)", async () => {
      vi.stubEnv("PORTAL_SERVER_KEY", "");
      await expectNoContent(await POST(req(valid)));
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("fallos del API", () => {
    it.each([204, 400, 404, 429, 500, 502, 201])("API %i -> 204", async (status) => {
      upstream(status);
      await expectNoContent(await POST(req(valid)));
    });

    it("error de red -> 204", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => Promise.reject(new Error("down")))
      );
      await expectNoContent(await POST(req(valid)));
    });

    it("timeout -> 204", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => Promise.reject(new DOMException("timeout", "TimeoutError")))
      );
      await expectNoContent(await POST(req(valid)));
    });

    it("usa un timeout de 2,5 s", async () => {
      const spy = vi.spyOn(AbortSignal, "timeout");
      await POST(req(valid));
      expect(spy).toHaveBeenCalledWith(2500);
    });
  });

  it("nunca expone la llave en cuerpo ni cabeceras de la respuesta", async () => {
    for (const status of [204, 400, 500]) {
      upstream(status);
      const res = await POST(req(valid));
      const headers = JSON.stringify([...res.headers.entries()]);
      expect(await res.text()).not.toContain(KEY);
      expect(headers).not.toContain(KEY);
    }
  });

  it("solo exporta POST (otros métodos dan 405 en Next)", async () => {
    const mod = await import("@/app/api/portal/visits/route");
    expect(Object.keys(mod).sort()).toEqual(["POST"]);
  });
});
