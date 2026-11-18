import { afterEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { serializeEnvelope } from "@sentry/core";
import type { ErrorEvent } from "@sentry/nextjs";
import {
  SENTRY_DATA_COLLECTION_OPTIONS,
  beforeBreadcrumb,
  beforeSend,
  scrubText,
  sentryOptions,
} from "@/lib/sentry-privacy";
import { sentryRelease } from "@/lib/sentry-release";
import { makeEventOnlyTransport } from "@/lib/sentry-transport";

const DSN = "https://k@o0.ingest.sentry.io/1";
// Canarios: si alguno aparece en el payload final, hay fuga.
const TOKEN = "sk_live_canario_51Htoken";
const PII = [
  "ana@example.com",
  "ana%40example.com",
  "3001234567",
  "300/123/4567",
  "300–123–4567",
  "Ana",
  "Perez",
  "1.2.3.4",
  TOKEN,
];

/** Inicia el SDK real con las opciones de la app y un transporte en memoria; devuelve lo enviado. */
async function captureWith(fn: () => void): Promise<string> {
  const sent: string[] = [];
  Sentry.init({
    ...sentryOptions(DSN)!,
    transport: () => ({
      send: async (envelope: Parameters<typeof serializeEnvelope>[0]) => {
        const serialized = serializeEnvelope(envelope);
        sent.push(
          typeof serialized === "string" ? serialized : new TextDecoder().decode(serialized)
        );
        return {};
      },
      flush: async () => true,
    }),
  });
  fn();
  await Sentry.flush(2000);
  return sent.join("\n");
}

afterEach(async () => {
  await Sentry.close(100);
});

describe("sentry-privacy: configuración efectiva", () => {
  it("sin DSN no inicializa", () => {
    expect(sentryOptions(undefined)).toBeNull();
    expect(sentryOptions("")).toBeNull();
  });

  it("dataCollection declara CADA campo en false/vacío (el SDK ignora sendDefaultPii si se pasa)", () => {
    const o = sentryOptions(DSN)!;
    expect(o.dataCollection).toBe(SENTRY_DATA_COLLECTION_OPTIONS);
    expect(o.dataCollection).toEqual({
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      mcp: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    });
  });

  it("solo errores: sin tracing ni replay", () => {
    const o = sentryOptions(DSN)!;
    expect(o.tracesSampleRate).toBe(0);
    expect(o).not.toHaveProperty("replaysSessionSampleRate");
    expect(o).not.toHaveProperty("replaysOnErrorSampleRate");
  });

  it("release: SENTRY_RELEASE manda y VERCEL_GIT_COMMIT_SHA es el fallback", () => {
    vi.stubEnv("SENTRY_RELEASE", "release-2026.11");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "abc123");
    expect(sentryOptions(DSN)!.release).toBe("release-2026.11");

    vi.stubEnv("SENTRY_RELEASE", "");
    expect(sentryOptions(DSN)!.release).toBe("abc123");

    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    expect(sentryOptions(DSN)).not.toHaveProperty("release");
  });

  it("sin sesiones: excluye BrowserSession y usa el transporte solo-eventos", () => {
    const o = sentryOptions(DSN)!;
    expect(o.integrations([{ name: "BrowserSession" }, { name: "Dedupe" }])).toEqual([
      { name: "Dedupe" },
    ]);
    expect(o.transport).toBe(makeEventOnlyTransport);
  });

  it("el cliente real resuelve la config sin datos personales", () => {
    Sentry.init({
      ...sentryOptions(DSN)!,
      transport: () => ({ send: async () => ({}), flush: async () => true }),
    });
    const resolved = Sentry.getClient()!.getOptions().dataCollection as Record<string, unknown>;
    expect(resolved.userInfo).toBe(false);
    expect(resolved.cookies).toBe(false);
    expect(resolved.httpBodies).toEqual([]);
    expect(resolved.urlQueryParams).toBe(false);
    expect(resolved.httpHeaders).toEqual({ request: false, response: false });
  });
});

describe("sentry-privacy: evento FINAL con transporte en memoria (SDK real)", () => {
  it("elimina PII de frames, transaction, contexts y hosts sin alterar IDs hex", async () => {
    const traceId = "123456789012345678901234567890ab";
    const spanId = "12345678901234ab";
    const payload = await captureWith(() => {
      Sentry.captureEvent({
        transaction: "/newsletter/Ana%20Perez",
        fingerprint: ["Ana Perez"],
        transaction_info: { source: "Ana Perez" as never },
        request: { url: "https://1.2.3.4/api/portal/leads" },
        contexts: {
          runtime: { name: "Ana Perez" },
          nextjs: { router_kind: "Ana Perez" },
          trace: { trace_id: traceId, span_id: spanId },
        },
        breadcrumbs: [
          { category: "fetch", data: { url: "https://3001234567.example.com/api/portal/leads" } },
        ],
        exception: {
          values: [
            {
              type: "Ana Perez",
              value: "Ana Perez",
              stacktrace: {
                frames: [
                  {
                    filename:
                      "app:///newsletter/Ana%20Perez?email=ana%40example.com&phone=3001234567",
                    module: "Ana Perez",
                    function: "Ana Perez",
                  },
                ],
              },
            },
          ],
        },
      });
    });
    expect(payload).toContain('"type":"Error"');
    expect(payload).toContain('"transaction":"/[unknown]"');
    expect(payload).toContain('"url":"/api/portal/leads"');
    expect(payload).toContain(traceId);
    expect(payload).toContain(spanId);
    expect(payload).not.toContain("fingerprint");
    expect(payload).not.toContain("transaction_info");
    for (const needle of [...PII, "Ana%20Perez"]) expect(payload, needle).not.toContain(needle);
  });

  it("el SDK normaliza el nombre de transacción libre y preserva solo assets técnicos", async () => {
    const payload = await captureWith(() => {
      Sentry.withScope((scope) => {
        scope.setTransactionName("Ana Perez");
        Sentry.captureEvent({
          exception: {
            values: [
              {
                type: "TypeError",
                value: "Ana Perez",
                stacktrace: {
                  frames: [
                    {
                      filename: "webpack:///Ana%20Perez?email=ana%40example.com",
                      function: "Ana Perez",
                    },
                    {
                      filename: "file:///Users/Ana%20Perez/private.js?phone=3001234567",
                      module: "Ana Perez",
                    },
                    {
                      filename:
                        "app:///_next/static/chunks/abcdef0123456789.js?email=ana%40example.com",
                    },
                  ],
                },
              },
            ],
          },
        });
      });
    });
    expect(payload).toContain('"transaction":"/[unknown]"');
    expect(payload).toContain('"type":"TypeError"');
    expect(payload).toContain('"filename":"/_next/static/chunks/abcdef0123456789.js"');
    expect(payload).toContain('"filename":"[redacted]"');
    for (const needle of [...PII, "Ana%20Perez"]) expect(payload, needle).not.toContain(needle);
  });

  it("vectores 2-4: request_path con query, extra, contexts, tags, user, breadcrumbs, mensaje y excepción", async () => {
    const payload = await captureWith(() => {
      Sentry.withScope((scope) => {
        scope.setUser({ email: "ana@example.com", ip_address: "1.2.3.4" });
        scope.setExtra("lead", {
          name: "Ana Perez",
          email: "ana@example.com",
          phone: "3001234567",
          token: TOKEN,
        });
        scope.setTag("email", "ana@example.com");
        scope.setTag("token", TOKEN);
        scope.setContext("lead", { name: "Ana Perez" });
        scope.setContext("nextjs", {
          request_path: "/api/portal/leads?email=ana@example.com&phone=3001234567&name=Ana%20Perez",
          router_kind: "App Router",
          router_path: "/api/portal/leads",
          route_type: "route",
        });
        Sentry.addBreadcrumb({
          category: "fetch",
          message: "POST ana@example.com",
          data: {
            url: "/api/portal/leads/ana%40example.com?email=ana@example.com",
            email: "ana@example.com",
            headers: { "x-portal-client-ip": "1.2.3.4", authorization: `Bearer ${TOKEN}` },
            status_code: 500,
          },
        });
        Sentry.addBreadcrumb({ category: "console", message: "Ana Perez +57 300/123/4567" });
        Sentry.captureException(
          new Error(`falló Ana Perez +57 300–123–4567 ana%40example.com ${TOKEN}`)
        );
        Sentry.captureMessage(`lead Ana Perez 300/123/4567 ${TOKEN}`);
      });
    });
    expect(payload).toContain('"type":"Error"'); // sí se envió el evento
    for (const needle of PII) expect(payload, needle).not.toContain(needle);
    expect(payload).not.toContain("x-portal-client-ip");
    expect(payload).toContain('"status_code":500');
    expect(payload).toContain("/[unknown]");
  });

  it("conserva environment del vocabulario en el evento final", async () => {
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NODE_ENV", "production");
    const payload = await captureWith(() => Sentry.captureException(new Error("boom")));
    expect(payload).toContain('"environment":"production"');
  });

  it("conserva el release confiable en el evento final y descarta uno ajeno", async () => {
    vi.stubEnv("SENTRY_RELEASE", "abc123");
    const payload = await captureWith(() => {
      Sentry.captureException(new Error("boom"));
      // Release de otra fuente (scope/evento manipulado): no sobrevive al saneado.
      Sentry.captureEvent({ release: "release-ajeno", exception: { values: [{ type: "Error" }] } });
    });
    expect(payload).toContain('"release":"abc123"');
    expect(payload).not.toContain("release-ajeno");
  });

  it("captureRequestError (Next) no deja query ni headers en el evento final", async () => {
    const payload = await captureWith(() => {
      Sentry.captureRequestError(
        new Error("boom"),
        {
          path: "/api/portal/leads?email=ana@example.com&phone=3001234567&name=Ana%20Perez",
          method: "POST",
          headers: { "x-portal-client-ip": "1.2.3.4", cookie: "s=1", authorization: TOKEN },
        },
        { routerKind: "App Router", routePath: "/api/portal/leads", routeType: "route" } as never
      );
    });
    expect(payload).toContain('"type":"Error"');
    for (const needle of PII) expect(payload, needle).not.toContain(needle);
    expect(payload).not.toContain("cookie");
  });
});

describe("sentry-privacy: beforeSend directo (segunda barrera)", () => {
  const dirty = () =>
    ({
      message: `Ana Perez 3001234567 ${TOKEN}`,
      logentry: { message: "x %s", params: ["ana@example.com", TOKEN] },
      user: { ip_address: "1.2.3.4" },
      server_name: "host",
      extra: { lead: { email: "ana@example.com", token: TOKEN } },
      tags: { email: "ana@example.com", token: TOKEN },
      request: {
        url: "https://acme.armio.co/p/acme/propiedades/ana%40example.com?email=a@b.co#x",
        method: "POST",
        query_string: "email=a@b.co",
        data: { name: "Ana", token: TOKEN },
        cookies: { s: "1" },
        headers: { "x-portal-client-ip": "1.2.3.4", authorization: `Bearer ${TOKEN}` },
      },
      contexts: {
        lead: { name: "Ana Perez" },
        runtime: { name: "node", version: "22" },
        nextjs: {
          request_path: "/api/portal/leads?email=ana@example.com",
          router_path: "/api/portal/leads",
        },
      },
      exception: {
        values: [
          {
            type: "Error",
            value: "Ana Perez 300/123/4567",
            stacktrace: { frames: [{ filename: "a.js", vars: { e: "x" } }] },
          },
        ],
      },
      breadcrumbs: [
        {
          category: "fetch",
          message: "m",
          data: {
            url: "/newsletter/ana%40example.com",
            email: "a@b.co",
            token: TOKEN,
            headers: { "x-portal-client-ip": "1.2.3.4", authorization: `Bearer ${TOKEN}` },
            status_code: 200,
          },
        },
        { category: "ui.input", message: "Ana" },
      ],
    }) as unknown as ErrorEvent;

  it("elimina todo lo que no está en la allowlist", () => {
    const out = beforeSend(dirty())!;
    const json = JSON.stringify(out);
    for (const needle of [...PII, "a@b.co"]) expect(json, needle).not.toContain(needle);
    expect(out).not.toHaveProperty("extra");
    expect(out).not.toHaveProperty("tags");
    expect(out).not.toHaveProperty("user");
    expect(out).not.toHaveProperty("message");
    expect(out).not.toHaveProperty("logentry");
    expect(out.request).toEqual({
      method: "POST",
      url: "/p/:tenant/propiedades/:property",
    });
    expect(out.contexts).toEqual({
      runtime: { name: "node", version: "22" },
      nextjs: { router_path: "/api/portal/leads", request_path: "/api/portal/leads" },
    });
    expect(out.breadcrumbs).toHaveLength(1);
    expect(out.breadcrumbs![0].data).toEqual({ url: "/[unknown]", status_code: 200 });
    expect(out.exception!.values![0].value).toBe("[redacted]");
  });

  it("parametriza rutas conocidas (tenant/propiedad) y descarta la query", () => {
    const e = {
      request: { url: "https://x.armio.co/p/acme/propiedades/casa-1?email=a@b.co" },
    } as unknown as ErrorEvent;
    expect(beforeSend(e)!.request!.url).toBe("/p/:tenant/propiedades/:property");
  });

  it("conserva release solo si es exactamente el valor confiable y el formato es válido", () => {
    const event = (release: string) => ({ release }) as unknown as ErrorEvent;
    vi.stubEnv("SENTRY_RELEASE", "armio-landing@1.2.3");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    expect(beforeSend(event("armio-landing@1.2.3"))!.release).toBe("armio-landing@1.2.3");

    // Otro release, aunque tenga formato válido, no es confiable.
    expect(beforeSend(event("armio-app@9.9.9"))).not.toHaveProperty("release");

    // El valor confiable también pasa por la regex: con espacios/PII se descarta.
    vi.stubEnv("SENTRY_RELEASE", "ana@example.com release");
    expect(beforeSend(event("ana@example.com release"))).not.toHaveProperty("release");

    // Sin valor confiable no se acepta ninguno.
    vi.stubEnv("SENTRY_RELEASE", "");
    expect(beforeSend(event("armio-landing@1.2.3"))).not.toHaveProperty("release");
  });

  it("acepta semver con metadatos (+) en build y runtime", () => {
    vi.stubEnv("SENTRY_RELEASE", "1.2.3+abc123");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    expect(sentryRelease()).toBe("1.2.3+abc123");
    expect(beforeSend({ release: "1.2.3+abc123" } as unknown as ErrorEvent)!.release).toBe(
      "1.2.3+abc123"
    );

    // Mismos caracteres y longitud que el build: un espacio invalida el release en ambos lados.
    vi.stubEnv("SENTRY_RELEASE", "1.2.3+abc 123");
    expect(sentryRelease()).toBeUndefined();
    expect(beforeSend({ release: "1.2.3+abc 123" } as unknown as ErrorEvent)).not.toHaveProperty(
      "release"
    );
  });

  it("conserva environment solo del vocabulario cerrado", () => {
    for (const environment of ["production", "staging", "development", "test", "preview"]) {
      expect(beforeSend({ environment } as unknown as ErrorEvent)!.environment, environment).toBe(
        environment
      );
    }
    for (const environment of ["qa", "ana@example.com", "Ana Perez", "PRODUCTION"]) {
      expect(beforeSend({ environment } as unknown as ErrorEvent), environment).not.toHaveProperty(
        "environment"
      );
    }
  });

  it("acepta el release inyectado en el bundle del cliente (mismo valor que usa el SDK)", () => {
    vi.stubEnv("SENTRY_RELEASE", "");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    // `withSentryConfig` inyecta `globalThis.SENTRY_RELEASE = { id }` en el bundle al compilar:
    // no hay process.env en el navegador. Otro valor inyectado/alterado se sigue descartando.
    vi.stubGlobal("SENTRY_RELEASE", { id: "sha-inyectado" });
    expect(sentryRelease()).toBe("sha-inyectado");
    expect(beforeSend({ release: "sha-inyectado" } as unknown as ErrorEvent)!.release).toBe(
      "sha-inyectado"
    );
    expect(beforeSend({ release: "otro-release" } as unknown as ErrorEvent)).not.toHaveProperty(
      "release"
    );

    // El formato se valida también sobre el valor inyectado.
    vi.stubGlobal("SENTRY_RELEASE", { id: "ana@example.com release" });
    expect(
      beforeSend({ release: "ana@example.com release" } as unknown as ErrorEvent)
    ).not.toHaveProperty("release");
  });

  it("conserva debug_meta mínimo (type, code_file, debug_id) y descarta el resto", () => {
    const event = {
      debug_meta: {
        images: [
          {
            type: "sourcemap",
            code_file: "app:///_next/static/chunks/abc123.js",
            debug_id: "12345678-1234-1234-1234-1234567890AB",
            image_addr: "0x1234",
            debug_file: "ana@example.com",
          },
          {
            type: "sourcemap",
            code_file:
              "https://acme.armio.co/_next/static/chunks/def456.js?email=ana%40example.com",
            debug_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          },
          {
            type: "wasm",
            code_file: "/var/task/.next/server/chunks/ghi789.wasm",
            debug_id: "11111111-2222-3333-4444-555555555555",
          },
          {
            // Artefacto real del servidor: route groups y segmentos dinámicos.
            type: "sourcemap",
            code_file: "/var/task/.next/server/app/(portal)/p/[tenant]/page.js",
            debug_id: "22222222-3333-4444-5555-666666666666",
          },
          {
            // Un chunk con `@` en el nombre se descarta: no se acepta `@` en `code_file`.
            type: "sourcemap",
            code_file:
              "/var/task/.next/server/chunks/ssr/[externals]_next_dist_compiled_@vercel_og_index_node.js",
            debug_id: "33333333-4444-5555-6666-777777777777",
          },
          { type: "elf", code_file: "/_next/static/chunks/no.js", debug_id: "abc" },
          {
            type: "sourcemap",
            code_file: "/Users/ana/ana@example.com.js",
            debug_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          },
          {
            // Con forma de email bajo /_next: se descarta para que `@` no transporte PII.
            type: "sourcemap",
            code_file: "/_next/static/chunks/ana@example.com.js",
            debug_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          },
          {
            type: "sourcemap",
            code_file: "/_next/static/chunks/no.js",
            debug_id: "ana@example.com",
          },
        ],
      },
      extra: { email: "ana@example.com" },
    } as unknown as ErrorEvent;

    const out = beforeSend(event)!;
    expect(out.debug_meta).toEqual({
      images: [
        {
          type: "sourcemap",
          code_file: "/_next/static/chunks/abc123.js",
          debug_id: "12345678-1234-1234-1234-1234567890ab",
        },
        {
          type: "sourcemap",
          code_file: "/_next/static/chunks/def456.js",
          debug_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        },
        {
          type: "wasm",
          code_file: "/_next/server/chunks/ghi789.wasm",
          debug_id: "11111111-2222-3333-4444-555555555555",
        },
        {
          type: "sourcemap",
          code_file: "/_next/server/app/(portal)/p/[tenant]/page.js",
          debug_id: "22222222-3333-4444-5555-666666666666",
        },
      ],
    });
    const json = JSON.stringify(out);
    for (const bad of ["ana@example.com", "Users", "0x1234", "image_addr", "debug_file", "email="])
      expect(json, bad).not.toContain(bad);
  });

  it("descarta debug_meta sin imágenes válidas", () => {
    const out = beforeSend({
      debug_meta: {
        images: [
          {
            type: "sourcemap",
            code_file: "/etc/passwd",
            debug_id: "12345678-1234-1234-1234-123456789012",
          },
          { type: "macho", code_file: "/_next/static/a.js", debug_id: "no-es-uuid" },
        ],
        extra: { email: "ana@example.com" },
      },
    } as unknown as ErrorEvent)!;
    expect(out).not.toHaveProperty("debug_meta");
  });

  it("si el saneado falla descarta el evento en vez de filtrar", () => {
    const frozen = Object.freeze({ extra: { a: 1 } }) as unknown as ErrorEvent;
    expect(beforeSend(frozen)).toBeNull();
  });

  it("beforeBreadcrumb descarta console/ui y sanea red", () => {
    expect(beforeBreadcrumb({ category: "console", message: "x" })).toBeNull();
    expect(beforeBreadcrumb({ category: "ui.input" })).toBeNull();
    expect(
      beforeBreadcrumb({
        category: "xhr",
        data: { url: "/api/portal/leads?email=a@b.co", body: "x" },
      })!.data
    ).toEqual({ url: "/api/portal/leads" });
  });

  it("scrubText (defensa adicional) cubre %40, / y guion largo", () => {
    expect(scrubText("ana%40example.com")).toBe("[email]");
    expect(scrubText("+57 300/123/4567")).toBe("[phone]");
    expect(scrubText("+57 300–123–4567")).toBe("[phone]");
    expect(scrubText("+57 300 123 4567")).toBe("[phone]");
  });
});

describe("sentry-privacy: gating sin DSN en ambos entrypoints", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@sentry/nextjs");
  });

  it("instrumentation.register() no llama a init sin DSN y sí con DSN", async () => {
    const init = vi.fn();
    vi.doMock("@sentry/nextjs", () => ({ init, captureRequestError: vi.fn() }));
    vi.stubEnv("SENTRY_DSN", "");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    const mod = await import("@/instrumentation");
    mod.register();
    expect(init).not.toHaveBeenCalled();
    vi.stubEnv("SENTRY_DSN", DSN);
    mod.register();
    expect(init).toHaveBeenCalledTimes(1);
  });

  it("instrumentation-client no llama a init sin DSN y sí con DSN", async () => {
    const init = vi.fn();
    vi.doMock("@sentry/nextjs", () => ({ init, captureRouterTransitionStart: vi.fn() }));
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    await import("@/instrumentation-client");
    expect(init).not.toHaveBeenCalled();
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    await import("@/instrumentation-client");
    expect(init).toHaveBeenCalledTimes(1);
  });
});
