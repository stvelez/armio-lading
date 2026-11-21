import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { makeProfile, makeProperty } from "./fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import FilterChips from "@/portal/components/FilterChips";
import PortalFooter from "@/portal/components/PortalFooter";
import PortalHeader from "@/portal/components/PortalHeader";
import PriceTag from "@/portal/components/PriceTag";
import PropertyCard from "@/portal/components/PropertyCard";
import { propertyHeading, zoneOf } from "@/portal/lib/format";

describe("propertyHeading: «Tipo en Operación, Zona»", () => {
  it("compone el título con tipo, operación y zona", () => {
    expect(
      propertyHeading({
        type: { name: "Apartamento" },
        purpose: { name: "Arriendo" },
        location: { area: "San Fernando", city: "Cali" },
      })
    ).toBe("Apartamento en Arriendo, San Fernando");
  });

  it("usa solo la zona cuando el API la entrega como «Zona, Ciudad»", () => {
    expect(zoneOf({ area: "Granada, Cali", city: "Cali" })).toBe("Granada");
    expect(propertyHeading(makeProperty())).toBe("Apartamento en Arriendo y venta, Granada");
  });

  it("sin zona cae a la ciudad y, sin ninguna, omite la coma", () => {
    const base = { type: { name: "Casa" }, purpose: { name: "Venta" } };
    expect(propertyHeading({ ...base, location: { area: null, city: "Cali" } })).toBe(
      "Casa en Venta, Cali"
    );
    expect(propertyHeading({ ...base, location: { area: null, city: null } })).toBe(
      "Casa en Venta"
    );
  });
});

describe("PropertyCard (markup de cardHTML)", () => {
  const html = renderToStaticMarkup(<PropertyCard property={makeProperty()} />);

  it("usa las clases del prototipo y el título compuesto, no el título libre", () => {
    for (const cls of [
      "card reveal",
      "card-media",
      "card-body",
      "card-title",
      "card-link",
      "loc",
    ]) {
      expect(html).toContain(cls);
    }
    expect(html).toContain(">Apartamento en Arriendo y venta, Granada<");
    expect(html).not.toContain("Penthouse con terraza en Granada");
  });

  it("lista las características en `.feats` con aria-label", () => {
    expect(html).toContain('class="feats" aria-label="Características"');
    expect(html).toContain("<li>3 hab.</li>");
    expect(html).toContain("<li>2 parq.</li>");
  });
});

describe("PriceTag: una sola jerarquía por operación", () => {
  const base = { currency: "COP" };

  it("arriendo: etiqueta, canon y /mes", () => {
    const html = renderToStaticMarkup(<PriceTag {...base} purpose="rent" price={2_600_000} />);
    expect(html).toContain('<span class="price-label">Arriendo</span>');
    expect(html).toContain("$ 2.600.000<small>/mes</small>");
  });

  it("venta: sin /mes", () => {
    const html = renderToStaticMarkup(<PriceTag {...base} purpose="sale" price={690_000_000} />);
    expect(html).toContain('<span class="price-label">Venta</span>');
    expect(html).not.toContain("/mes");
  });

  it("both: la operación filtrada va primero y la otra como `.price-alt`", () => {
    const props = { ...base, purpose: "both", price: 690_000_000, rentPrice: 3_450_000 };
    const rent = renderToStaticMarkup(<PriceTag {...props} operacion="arriendo" />);
    expect(rent.indexOf("$ 3.450.000")).toBeLessThan(rent.indexOf("$ 690.000.000"));
    expect(rent).toContain('class="price-alt"');
    const sale = renderToStaticMarkup(<PriceTag {...props} />);
    expect(sale.indexOf("$ 690.000.000")).toBeLessThan(sale.indexOf("$ 3.450.000"));
  });

  it("ficha (lg): una `.od-stat` por operación, con /mes solo una vez", () => {
    const html = renderToStaticMarkup(
      <PriceTag {...base} purpose="both" price={690_000_000} rentPrice={3_450_000} size="lg" />
    );
    expect(html.match(/class="od-stat"/g)).toHaveLength(2);
    expect(html.match(/\/mes/g)).toHaveLength(1);
  });
});

describe("cabecera y pie", () => {
  const profile = makeProfile({
    contact: { whatsapp: "300 123 4567", phone: "601 555 0101", email: "hola@demo.co" },
  });

  it("la cabecera usa `.site-header` con la marca en iniciales y WhatsApp", () => {
    const html = renderToStaticMarkup(<PortalHeader profile={profile} />);
    expect(html).toContain('class="site-header"');
    expect(html).toContain('class="brand-mark" aria-hidden="true">ID<');
    expect(html).toContain("https://wa.me/573001234567");
    expect(html).not.toContain("hola@demo.co");
  });

  it("el correo público aparece en el pie", () => {
    const html = renderToStaticMarkup(<PortalFooter profile={profile} />);
    expect(html).toContain('class="footer"');
    expect(html).toContain('href="mailto:hola@demo.co"');
  });
});

describe("FilterChips: la URL es la fuente de verdad", () => {
  const facets = makeProfile({
    facets: {
      purposes: [],
      types: [{ slug: "casa", name: "Casa", count: 2 }],
      cities: [{ code: "1", name: "Cali", count: 2 }],
      neighborhoods: [],
      price_range: { min: null, max: null },
    },
  }).facets;

  it("sin filtros no pinta nada", () => {
    expect(
      renderToStaticMarkup(<FilterChips basePath="/propiedades" filters={{}} facets={facets} />)
    ).toBe("");
  });

  it("cada chip es un enlace que quita solo ese filtro y conserva el orden", () => {
    const html = renderToStaticMarkup(
      <FilterChips
        basePath="/propiedades"
        filters={{ operacion: "venta", tipo: "casa", orden: "precio_asc", page: 3 }}
        facets={facets}
      />
    );
    expect(html).toContain('aria-label="Quitar filtro Venta"');
    expect(html).toContain('aria-label="Quitar filtro Casa"');
    expect(html).toContain('href="/propiedades?tipo=casa&amp;orden=precio_asc"');
    expect(html).toContain('href="/propiedades?operacion=venta&amp;orden=precio_asc"');
    expect(html).toContain("Quitar filtros");
  });
});
