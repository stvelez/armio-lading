import { describe, expect, it } from "vitest";
import { hasAnyFilter, hasNonCanonicalFilters, parseFilters, toQuery } from "@/portal/lib/filters";

describe("parseFilters", () => {
  it("convierte searchParams válidos", () => {
    expect(
      parseFilters({
        operacion: "venta",
        tipo: "apartamento",
        ciudad: "76001",
        barrio: " Laureles ",
        precio_min: "100",
        precio_max: "500",
        habitaciones_min: "2",
        banos_min: "1",
        orden: "precio_asc",
        page: "3",
      })
    ).toEqual({
      operacion: "venta",
      tipo: "apartamento",
      ciudad: "76001",
      barrio: "Laureles",
      precio_min: 100,
      precio_max: 500,
      habitaciones_min: 2,
      banos_min: 1,
      orden: "precio_asc",
      page: 3,
    });
  });

  it("descarta valores inválidos", () => {
    expect(
      parseFilters({
        operacion: "regalo",
        tipo: "Apto Raro!",
        ciudad: "abc",
        precio_min: "-5",
        precio_max: "1e9",
        habitaciones_min: "11",
        banos_min: "x",
        orden: "aleatorio",
        page: "0",
        desconocido: "1",
      })
    ).toEqual({});
  });

  it("usa el primer valor de parámetros repetidos", () => {
    expect(parseFilters({ operacion: ["arriendo", "venta"] })).toEqual({ operacion: "arriendo" });
  });

  it("descarta precio_max menor que precio_min", () => {
    expect(parseFilters({ precio_min: "500", precio_max: "100" })).toEqual({ precio_min: 500 });
  });

  it("page 1 no se conserva", () => {
    expect(parseFilters({ page: "1" })).toEqual({});
  });
});

describe("toQuery", () => {
  it("vacío -> cadena vacía", () => {
    expect(toQuery({})).toBe("");
  });

  it("serializa filtros y extras, ignorando undefined", () => {
    expect(toQuery({ operacion: "venta", page: undefined, precio_min: 0 }, { limit: 12 })).toBe(
      "?operacion=venta&precio_min=0&limit=12"
    );
  });

  it("parse -> toQuery -> parse es idempotente", () => {
    const filters = parseFilters({ operacion: "arriendo", barrio: "El Poblado", page: "2" });
    const qs = toQuery(filters);
    const params = Object.fromEntries(new URLSearchParams(qs));
    expect(parseFilters(params)).toEqual(filters);
  });

  it("codifica caracteres especiales del barrio", () => {
    expect(toQuery({ barrio: "San José & Co" })).toBe("?barrio=San+Jos%C3%A9+%26+Co");
  });
});

describe("filtros canónicos", () => {
  it("operación y página son canónicos", () => {
    expect(hasNonCanonicalFilters({ operacion: "venta", page: 2 })).toBe(false);
  });

  it.each([
    { tipo: "casa" },
    { ciudad: "1" },
    { barrio: "x" },
    { precio_min: 0 },
    { precio_max: 0 },
    { habitaciones_min: 0 },
    { banos_min: 0 },
    { orden: "recientes" as const },
  ])("%o no es canónico", (f) => {
    expect(hasNonCanonicalFilters(f)).toBe(true);
  });

  it("hasAnyFilter incluye la operación", () => {
    expect(hasAnyFilter({})).toBe(false);
    expect(hasAnyFilter({ page: 2 })).toBe(false);
    expect(hasAnyFilter({ operacion: "venta" })).toBe(true);
  });
});
