import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/portal/leads/route";

const KEY = "super-secret-portal-key";

const validBody = {
  slug: "inmobiliaria-demo",
  property_code: 9,
  name: "Ana Pérez",
  phone: "3001234567",
  email: "ana@example.com",
  message: "Hola",
  consent: true,
  consent_version: "1.0",
  marketing_consent: false,
  website: "",
  elapsed_ms: 5000,
  page_url: "http://localhost:3000/p/inmobiliaria-demo/propiedades/9-x",
};

function req(body: unknown, headers: Record<string, string> = {}, raw?: string) {
  return new NextRequest("http://localhost:3000/api/portal/leads", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: raw ?? JSON.stringify(body),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;
const upstream = (status: number) => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ secret: KEY }), { status }));
  vi.stubGlobal("fetch", fetchMock);
};

beforeEach(() => {
  vi.stubEnv("PORTAL_SERVER_KEY", KEY);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  upstream(202);
});

const sentHeaders = () => (fetchMock.mock.calls[0] as any)[1].headers as Record<string, string>;
const sentBody = () => JSON.parse((fetchMock.mock.calls[0] as any)[1].body);

describe("POST /api/portal/leads", () => {
  it("reenvía al API con la llave y la IP del primer valor de x-forwarded-for", async () => {
    const res = await POST(
      req(validBody, { "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2", "user-agent": "UA/1" })
    );
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ received: true });

    const [url, init] = fetchMock.mock.calls[0] as any;
    expect(url).toMatch(/\/public\/portal\/inmobiliaria-demo\/leads$/);
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("no-store");
    expect(sentHeaders()["x-portal-key"]).toBe(KEY);
    expect(sentHeaders()["x-portal-client-ip"]).toBe("203.0.113.7");
    expect(sentHeaders()["User-Agent"]).toBe("UA/1");
  });

  it("el slug va en la URL, no en el cuerpo reenviado", async () => {
    await POST(req(validBody));
    expect(sentBody().slug).toBeUndefined();
    expect(sentBody()).toMatchObject({ name: "Ana Pérez", consent: true, property_code: 9 });
  });

  it("usa x-real-ip si no hay x-forwarded-for", async () => {
    await POST(req(validBody, { "x-real-ip": "198.51.100.4" }));
    expect(sentHeaders()["x-portal-client-ip"]).toBe("198.51.100.4");
  });

  it("acepta IPv6", async () => {
    await POST(req(validBody, { "x-forwarded-for": "2001:db8::1" }));
    expect(sentHeaders()["x-portal-client-ip"]).toBe("2001:db8::1");
  });

  it("no reenvía una IP con formato inválido", async () => {
    await POST(req(validBody, { "x-forwarded-for": "no-es-ip; drop table" }));
    expect(sentHeaders()["x-portal-client-ip"]).toBeUndefined();
    expect(sentHeaders()["x-portal-key"]).toBe(KEY);
  });

  it("sin PORTAL_SERVER_KEY no envía llave ni IP", async () => {
    vi.stubEnv("PORTAL_SERVER_KEY", "");
    await POST(req(validBody, { "x-forwarded-for": "203.0.113.7" }));
    expect(sentHeaders()["x-portal-key"]).toBeUndefined();
    expect(sentHeaders()["x-portal-client-ip"]).toBeUndefined();
  });

  it("nunca expone la llave en cuerpo ni cabeceras de la respuesta", async () => {
    for (const status of [202, 400, 404, 429, 500]) {
      upstream(status);
      const res = await POST(req(validBody));
      const text = await res.text();
      const headers = JSON.stringify([...res.headers.entries()]);
      expect(text).not.toContain(KEY);
      expect(headers).not.toContain(KEY);
      expect(res.headers.get("cache-control")).toBe("no-store");
    }
  });

  it.each([
    [400, 400, "invalid"],
    [404, 404, "not_found"],
    [429, 429, "rate_limited"],
    [500, 502, "unavailable"],
    [503, 502, "unavailable"],
    [201, 502, "unavailable"],
  ])("API %i -> %i %s", async (apiStatus, status, error) => {
    upstream(apiStatus);
    const res = await POST(req(validBody));
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ error });
  });

  it("fallo de red -> 502", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("down")))
    );
    const res = await POST(req(validBody));
    expect(res.status).toBe(502);
  });

  describe("cuerpo inválido (no llama al API)", () => {
    const cases: Record<string, unknown> = {
      "sin consentimiento": { ...validBody, consent: false },
      "consent ausente": { ...validBody, consent: undefined },
      "consent como cadena": { ...validBody, consent: "true" },
      "nombre corto": { ...validBody, name: "A" },
      "teléfono corto": { ...validBody, phone: "123" },
      "correo inválido": { ...validBody, email: "no-es-correo" },
      "mensaje de 1001 caracteres": { ...validBody, message: "x".repeat(1001) },
      "slug con mayúsculas": { ...validBody, slug: "Inmo/../x" },
      "slug con ruta": { ...validBody, slug: "a/b" },
      "property_code negativo": { ...validBody, property_code: -1 },
      "falta honeypot": { ...validBody, website: undefined },
      "elapsed_ms negativo": { ...validBody, elapsed_ms: -1 },
      "falta consent_version": { ...validBody, consent_version: undefined },
    };
    it.each(Object.entries(cases))("%s -> 400", async (_name, body) => {
      const res = await POST(req(body));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "invalid" });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("JSON malformado -> 400", async () => {
      const res = await POST(req(null, {}, "{no es json"));
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("cuerpo mayor de 8 KB -> 400", async () => {
      const res = await POST(req({ ...validBody, page_url: "x".repeat(9000) }));
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  it("mensaje de exactamente 1000 caracteres es válido", async () => {
    const res = await POST(req({ ...validBody, message: "x".repeat(1000) }));
    expect(res.status).toBe(202);
  });

  it("campos opcionales pueden faltar", async () => {
    const { property_code, email, message, marketing_consent, page_url, ...min } = validBody;
    void property_code;
    void email;
    void message;
    void marketing_consent;
    void page_url;
    expect((await POST(req(min))).status).toBe(202);
  });

  it("descarta campos desconocidos antes de reenviar", async () => {
    await POST(req({ ...validBody, admin: true }));
    expect(sentBody().admin).toBeUndefined();
  });
});
