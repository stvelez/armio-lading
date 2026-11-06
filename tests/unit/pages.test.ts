import { beforeEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl } from "@/portal/lib/format";
import { makeProfile, makeProperty } from "./fixtures";

const state = vi.hoisted(() => ({
  profile: null as unknown,
  property: null as unknown,
  loadProperty: null as unknown as ReturnType<typeof vi.fn>,
}));

vi.mock("@/portal/lib/api", async () => {
  const { notFound, permanentRedirect } = await import("next/navigation");
  const unwrap = (r: any, rebuild: (s: string) => string) => {
    if (r.kind === "notfound") notFound();
    if (r.kind === "redirect") permanentRedirect(rebuild(r.slug));
    return r.data;
  };
  state.loadProperty = vi.fn(async (...args: unknown[]) => (void args, state.property));
  const loadProfile = vi.fn(async (...args: unknown[]) => (void args, state.profile));
  return {
    unwrap,
    loadProfile,
    loadProperty: state.loadProperty,
    getProfile: async (slug: string, rebuild: (s: string) => string) =>
      unwrap(await loadProfile(slug), rebuild),
    getProperties: vi.fn(),
  };
});

import PropertyPage, {
  generateMetadata as propertyMetadata,
} from "@/app/(portal)/p/[tenant]/propiedades/[property]/page";
import { generateMetadata as listingMetadata } from "@/app/(portal)/p/[tenant]/propiedades/page";

const ok = (data: unknown) => ({ kind: "ok", data });
const canonical = "9-penthouse-con-terraza-en-granada";

beforeEach(() => {
  state.profile = ok(makeProfile());
  state.property = ok(makeProperty());
  state.loadProperty.mockClear();
});

const meta = (property: string) =>
  propertyMetadata({ params: Promise.resolve({ tenant: "inmobiliaria-demo", property }) });

describe("[property] -> código", () => {
  it.each([
    [canonical, 9],
    ["9", 9],
    ["123-algo", 123],
    ["42-%C3%A1rbol", 42],
  ])("%s -> code %i", async (raw, code) => {
    await meta(raw);
    expect(state.loadProperty).toHaveBeenCalledWith("inmobiliaria-demo", code);
  });

  it.each(["abc", "-9", "0", "0-x", "1234567890-x", ""])(
    "%j -> noindex y sin llamar al API",
    async (raw) => {
      const m = await meta(raw);
      expect(m.robots).toEqual({ index: false, follow: false });
      expect(state.loadProperty).not.toHaveBeenCalled();
    }
  );
});

describe("generateMetadata de la ficha", () => {
  it("canónica absoluta {code}-{slug}", async () => {
    const m = await meta("9");
    expect(m.alternates?.canonical).toBe(
      absoluteUrl(`/p/inmobiliaria-demo/propiedades/${canonical}`)
    );
    expect(m.robots).toEqual({ index: true, follow: true });
  });

  it("noindex si el API no encuentra la propiedad", async () => {
    state.property = { kind: "notfound" };
    const m = await meta("9");
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(m.alternates).toBeUndefined();
  });
});

describe("redirección y 404 de la ficha", () => {
  const render = (property: string) =>
    PropertyPage({ params: Promise.resolve({ tenant: "inmobiliaria-demo", property }) });

  it("code sin slug -> redirección permanente (308) a la canónica", async () => {
    const err: any = await render("9").catch((e) => e);
    expect(err.digest).toMatch(/^NEXT_REDIRECT;replace;/);
    expect(err.digest).toContain(`/p/inmobiliaria-demo/propiedades/${canonical}`);
    expect(err.digest).toContain(";308;");
  });

  it("slug desactualizado -> 308 a la canónica", async () => {
    const err: any = await render("9-slug-viejo").catch((e) => e);
    expect(err.digest).toContain(`/propiedades/${canonical}`);
    expect(err.digest).toContain(";308;");
  });

  it("code no numérico -> 404", async () => {
    const err: any = await render("hola").catch((e) => e);
    expect(err.digest).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("propiedad inexistente -> 404", async () => {
    state.property = { kind: "notfound" };
    const err: any = await render("99-x").catch((e) => e);
    expect(err.digest).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("slug de tenant cambiado (redirect_to) -> 308 a la misma ficha con el slug nuevo", async () => {
    state.profile = { kind: "redirect", slug: "nuevo-slug" };
    const err: any = await render(canonical).catch((e) => e);
    expect(err.digest).toContain(`/p/nuevo-slug/propiedades/${canonical}`);
    expect(err.digest).toContain(";308;");
  });

  it("con la URL canónica renderiza sin lanzar", async () => {
    await expect(render(canonical)).resolves.toBeTruthy();
  });
});

describe("generateMetadata del listado", () => {
  const listing = (sp: Record<string, string>) =>
    listingMetadata({
      params: Promise.resolve({ tenant: "inmobiliaria-demo" }),
      searchParams: Promise.resolve(sp),
    });
  const base = absoluteUrl("/p/inmobiliaria-demo/propiedades");

  it("sin filtros: canónica limpia e indexable", async () => {
    const m = await listing({});
    expect(m.alternates?.canonical).toBe(base);
    expect(m.robots).toEqual({ index: true, follow: true });
  });

  it("operación y página están en la canónica y siguen indexables", async () => {
    const m = await listing({ operacion: "venta", page: "2" });
    expect(m.alternates?.canonical).toBe(`${base}?operacion=venta&page=2`);
    expect(m.robots).toEqual({ index: true, follow: true });
    expect((m.title as any).absolute).toContain("Página 2");
  });

  it("filtros no canónicos -> noindex y canónica sin esos filtros", async () => {
    const m = await listing({ operacion: "arriendo", tipo: "casa", precio_min: "100" });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.alternates?.canonical).toBe(`${base}?operacion=arriendo`);
  });

  it("parámetros desconocidos o inválidos se ignoran", async () => {
    const m = await listing({ utm_source: "x", operacion: "regalo" });
    expect(m.robots).toEqual({ index: true, follow: true });
    expect(m.alternates?.canonical).toBe(base);
  });

  it("tenant inexistente -> noindex/nofollow", async () => {
    state.profile = { kind: "notfound" };
    expect((await listing({})).robots).toEqual({ index: false, follow: false });
  });
});
