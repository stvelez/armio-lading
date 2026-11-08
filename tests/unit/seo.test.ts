import { describe, expect, it } from "vitest";
import { safeJsonLd } from "@/portal/lib/format";
import { portalUrl } from "@/portal/lib/urls";
import { buildMetadata, propertyJsonLd } from "@/portal/lib/seo";
import { makeProfile, makeProperty } from "./fixtures";

const url = "https://inmobiliaria-demo.armio.co/propiedades/9-penthouse";

function listing(property = makeProperty()) {
  const [l] = propertyJsonLd({ property, profile: makeProfile(), url });
  return l as Record<string, any>;
}

describe("propertyJsonLd", () => {
  it("devuelve el anuncio y las migas de pan", () => {
    const [l, b] = propertyJsonLd({ property: makeProperty(), profile: makeProfile(), url });
    expect(l["@type"]).toBe("RealEstateListing");
    expect(b["@type"]).toBe("BreadcrumbList");
    expect((b as any).itemListElement).toHaveLength(3);
  });

  it("both con rent_price emite dos ofertas; sin rent_price, una", () => {
    const both = { slug: "both" as const, name: "Arriendo y venta" };
    const two = listing(makeProperty({ purpose: both, rent_price: 2_500_000 }));
    expect(two.offers).toHaveLength(2);
    expect(two.offers.map((o: any) => o.price)).toEqual([makeProperty().price, 2_500_000]);
    expect(two.offers.map((o: any) => o.businessFunction)).toEqual([
      "http://purl.org/goodrelations/v1#Sell",
      "http://purl.org/goodrelations/v1#LeaseOut",
    ]);
    const one = listing(makeProperty({ purpose: both, rent_price: null }));
    expect(Array.isArray(one.offers)).toBe(false);
  });

  it("una sola oferta: Sell en venta, LeaseOut en arriendo", () => {
    const sale = listing(makeProperty({ purpose: { slug: "sale" as const, name: "Venta" } }));
    expect(sale.offers.businessFunction).toBe("http://purl.org/goodrelations/v1#Sell");
    const rent = listing(makeProperty({ purpose: { slug: "rent" as const, name: "Arriendo" } }));
    expect(rent.offers.businessFunction).toBe("http://purl.org/goodrelations/v1#LeaseOut");
  });

  it("no incluye calle ni geo cuando la ubicación no es exacta", () => {
    const l = listing();
    expect(l.about.address.streetAddress).toBeUndefined();
    expect(l.about.geo).toBeUndefined();
    expect(JSON.stringify(l)).not.toMatch(/streetAddress|GeoCoordinates/);
  });

  it("nunca emite streetAddress, ni siquiera con ubicación exacta; sí emite geo", () => {
    const l = listing(
      makeProperty({
        location: {
          area: "Granada",
          city: "Cali",
          department: "Valle del Cauca",
          address: "Calle 1 # 2-3",
          latitude: 3.45,
          longitude: -76.53,
        },
      })
    );
    expect(l.about.address.streetAddress).toBeUndefined();
    expect(JSON.stringify(l)).not.toContain("Calle 1");
    expect(l.about.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 3.45,
      longitude: -76.53,
    });
  });

  it("omite geo si falta una de las coordenadas", () => {
    const l = listing(
      makeProperty({
        location: { area: null, city: "Cali", department: null, latitude: 3.4 },
      })
    );
    expect(l.about.geo).toBeUndefined();
  });

  it("solo incluye imágenes https", () => {
    const l = listing(
      makeProperty({
        images: [
          { url: "https://media.armio.co/a.jpg", order: 0 },
          { url: "http://insecure.test/b.jpg", order: 1 },
          { url: "javascript:alert(1)", order: 2 },
        ],
      })
    );
    expect(l.image).toEqual(["https://media.armio.co/a.jpg"]);
  });

  it("reservada -> LimitedAvailability; si no, InStock", () => {
    expect(listing(makeProperty({ badge: "reservada" })).offers.availability).toBe(
      "https://schema.org/LimitedAvailability"
    );
    expect(listing().offers.availability).toBe("https://schema.org/InStock");
  });

  it("serializado con safeJsonLd escapa < como \\u003c y sigue siendo JSON válido", () => {
    const property = makeProperty({ title: "</script><script>alert(1)</script>" });
    const out = safeJsonLd(propertyJsonLd({ property, profile: makeProfile(), url }));
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out)[0].name).toBe("</script><script>alert(1)</script>");
  });
});

describe("buildMetadata", () => {
  const base = { title: "T", description: "D", url: portalUrl("x", "/propiedades"), siteName: "X" };

  it("canónica absoluta e indexable por defecto", () => {
    const m = buildMetadata(base);
    expect(m.alternates?.canonical).toBe(portalUrl("x", "/propiedades"));
    expect(m.robots).toEqual({ index: true, follow: true });
    expect(m.openGraph).toMatchObject({ url: portalUrl("x", "/propiedades"), siteName: "X" });
  });

  it("noindex conserva follow", () => {
    expect(buildMetadata({ ...base, noindex: true }).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it("solo usa imágenes https en og/twitter", () => {
    const ok = buildMetadata({ ...base, image: "https://media.armio.co/a.jpg" });
    expect((ok.openGraph as any).images).toEqual([{ url: "https://media.armio.co/a.jpg" }]);
    expect((ok.twitter as any).images).toEqual(["https://media.armio.co/a.jpg"]);
    const bad = buildMetadata({ ...base, image: "http://x.test/a.jpg" });
    expect((bad.openGraph as any).images).toBeUndefined();
  });
});
