import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import PriceTag, { BOTH_NOTE } from "@/portal/components/PriceTag";
import {
  DEFAULT_PRIMARY,
  formatPrice,
  httpsUrl,
  onColor,
  operationLabel,
  safeColor,
  safeJsonLd,
  whatsappNumber,
} from "@/portal/lib/format";

describe("formatPrice", () => {
  it("COP con separador de miles colombiano", () => {
    expect(formatPrice(690_000_000)).toBe("$ 690.000.000");
    expect(formatPrice(3_500_000, "COP")).toBe("$ 3.500.000");
  });
  it("redondea y antepone otras monedas", () => {
    expect(formatPrice(1234.6)).toBe("$ 1.235");
    expect(formatPrice(1000, "USD")).toBe("USD 1.000");
  });
});

describe("operationLabel", () => {
  it("both -> arriendo y venta", () => {
    expect(operationLabel("rent")).toBe("arriendo");
    expect(operationLabel("sale")).toBe("venta");
    expect(operationLabel("both")).toBe("arriendo y venta");
  });
});

const price = (purpose: string, extra: Record<string, unknown> = {}) =>
  renderToStaticMarkup(
    createElement(PriceTag, { purpose, price: 3_500_000, currency: "COP", ...extra })
  );

describe("PriceTag", () => {
  it("both con rent_price: dos líneas, venta primero y sin nota", () => {
    const html = price("both", { rentPrice: 2_000_000 });
    expect(html).toContain("Venta");
    expect(html).toContain("Arriendo");
    expect(html).toContain("$ 2.000.000");
    expect(html).toContain("$ 3.500.000");
    expect(html).toContain("/mes");
    expect(html).not.toContain(BOTH_NOTE);
    expect(html.indexOf("Venta")).toBeLessThan(html.indexOf("Arriendo"));
  });

  it("both con rent_price y operación arriendo: el canon va primero", () => {
    const html = price("both", { rentPrice: 2_000_000, operacion: "arriendo" });
    expect(html.indexOf("Arriendo")).toBeLessThan(html.indexOf("Venta"));
  });

  it("both sin rent_price: precio sin rotular con la nota de consulta", () => {
    for (const html of [price("both"), price("both", { rentPrice: null })]) {
      expect(html).toContain(BOTH_NOTE);
      expect(html).not.toContain("/mes");
      expect(html).not.toContain("Venta");
    }
  });

  it("arriendo: /mes y sin nota", () => {
    const html = price("rent");
    expect(html).toContain("$ 3.500.000");
    expect(html).toContain("/mes");
    expect(html).not.toContain(BOTH_NOTE);
  });
  it("venta: sin /mes ni nota", () => {
    const html = price("sale");
    expect(html).not.toContain("/mes");
    expect(html).not.toContain(BOTH_NOTE);
  });
  it("both: nota de consulta y sin /mes", () => {
    const html = price("both");
    expect(html).toContain(BOTH_NOTE);
    expect(html).not.toContain("/mes");
  });
  it("precio 0 -> Consultar precio y sin /mes", () => {
    const html = renderToStaticMarkup(
      createElement(PriceTag, { purpose: "rent", price: 0, currency: "COP" })
    );
    expect(html).toContain("Consultar precio");
    expect(html).not.toContain("/mes");
  });
  it("precio 0 con both: Consultar precio, nota de consulta y sin /mes", () => {
    for (const extra of [{}, { rentPrice: null }]) {
      const html = price("both", { price: 0, ...extra });
      expect(html).toContain("Consultar precio");
      expect(html).toContain(BOTH_NOTE);
      expect(html).not.toContain("/mes");
    }
  });
  it("administración", () => {
    expect(price("rent", { adminIncluded: true })).toContain("Administración incluida");
    expect(price("rent", { adminFee: 200_000 })).toContain("+ $ 200.000 de administración");
  });
});

function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const ch = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("onColor", () => {
  it("texto oscuro sobre fondos claros y blanco sobre oscuros", () => {
    expect(onColor("#FFFFFF")).toBe("#111827");
    expect(onColor("#FFFF00")).toBe("#111827");
    expect(onColor("#000000")).toBe("#FFFFFF");
    expect(onColor("#1E3A8A")).toBe("#FFFFFF");
  });
  it.each(["#00965E", "#00A86B", "#FF5733", "#0000FF", "#F4C430", "#808080"])(
    "%s: elige el color con mayor contraste",
    (bg) => {
      const chosen = onColor(bg);
      const other = chosen === "#FFFFFF" ? "#111827" : "#FFFFFF";
      expect(contrast(bg, chosen)).toBeGreaterThanOrEqual(contrast(bg, other));
    }
  );
});

describe("onColor: BUG CONOCIDO", () => {
  // Regresión: onColor() calculaba el contraste del texto oscuro como si fuera negro puro y,
  // en grises medios, elegía blanco aunque #111827 diera más contraste real.
  it("#777777: debería elegir el color con mayor contraste real", () => {
    const chosen = onColor("#777777");
    const other = chosen === "#FFFFFF" ? "#111827" : "#FFFFFF";
    expect(contrast("#777777", chosen)).toBeGreaterThanOrEqual(contrast("#777777", other));
  });
});

describe("safeColor", () => {
  it("acepta #RRGGBB y lo normaliza a mayúsculas", () => {
    expect(safeColor("#00a86b")).toBe("#00A86B");
  });
  it.each([
    null,
    undefined,
    "",
    "00A86B",
    "#FFF",
    "#GGGGGG",
    "#00A86B1",
    "red",
    "#00A86B;}</style>",
  ])("%s -> color por defecto", (v) => {
    expect(safeColor(v)).toBe(DEFAULT_PRIMARY);
  });
});

describe("helpers de URL y JSON", () => {
  it("httpsUrl solo acepta https", () => {
    expect(httpsUrl("https://a.test/x.jpg")).toBe("https://a.test/x.jpg");
    expect(httpsUrl("http://a.test")).toBeNull();
    expect(httpsUrl("javascript:alert(1)")).toBeNull();
    expect(httpsUrl("no es url")).toBeNull();
    expect(httpsUrl(null)).toBeNull();
  });
  it("whatsappNumber agrega 57 a celulares de 10 dígitos", () => {
    expect(whatsappNumber("300 123 4567")).toBe("573001234567");
    expect(whatsappNumber("+57 300 123 4567")).toBe("573001234567");
    expect(whatsappNumber("123")).toBeNull();
  });
  it("safeJsonLd escapa <", () => {
    expect(safeJsonLd({ a: "<b>" })).toBe('{"a":"\\u003cb>"}');
  });
});
