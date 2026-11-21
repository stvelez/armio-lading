import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PropertyCard from "@/portal/components/PropertyCard";
import PropertyGallery from "@/portal/components/PropertyGallery";
import { thumbProps } from "@/portal/lib/format";
import { makeProperty } from "./fixtures";

const ORIGINAL = "https://media.armio.co/properties/images/t1/abc.jpg";
const THUMB = "https://media.armio.co/properties/images/t1/abc_w800.webp";

/**
 * `next/image` solo valida `images.remotePatterns` fuera de producción, y vitest no carga
 * `next.config.ts` (donde media.armio.co sí está permitido). La config de test fija
 * NODE_ENV=development para que React exponga `act`, así que aquí se restaura "production"
 * y el render es el del build real.
 */
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
});

describe("thumbProps", () => {
  it("miniatura de nuestro almacenamiento: la optimiza next/image", () => {
    expect(thumbProps({ url: ORIGINAL, thumbnail_url: THUMB })).toEqual({
      src: THUMB,
      unoptimized: false,
    });
  });

  it("sin miniatura (API viejo o foto antigua): cae al original optimizado", () => {
    expect(thumbProps({ url: ORIGINAL })).toEqual({ src: ORIGINAL, unoptimized: false });
    expect(thumbProps({ url: ORIGINAL, thumbnail_url: null })).toEqual({
      src: ORIGINAL,
      unoptimized: false,
    });
  });

  it("miniatura http o de un host desconocido: se ignora y se usa el original", () => {
    expect(thumbProps({ url: ORIGINAL, thumbnail_url: THUMB.replace("https", "http") })).toEqual({
      src: ORIGINAL,
      unoptimized: false,
    });
    expect(thumbProps({ url: ORIGINAL, thumbnail_url: "https://evil.example/x.webp" })).toEqual({
      src: ORIGINAL,
      unoptimized: false,
    });
  });

  it("original de un host desconocido: sin optimizar; sin URL válida: null", () => {
    expect(thumbProps({ url: "https://otro.example/f.jpg" })).toEqual({
      src: "https://otro.example/f.jpg",
      unoptimized: true,
    });
    expect(thumbProps({ url: "http://media.armio.co/f.jpg" })).toBeNull();
    expect(thumbProps(null)).toBeNull();
    expect(thumbProps(undefined)).toBeNull();
  });
});

describe("PropertyCard con miniatura", () => {
  const render = (primary_image: { url: string; thumbnail_url?: string | null } | null) =>
    renderToStaticMarkup(
      createElement(PropertyCard, {
        property: { ...makeProperty(), primary_image } as never,
      })
    );

  it("usa la miniatura a través del optimizador de next/image", () => {
    const html = render({ url: ORIGINAL, thumbnail_url: THUMB });
    expect(html).toContain("abc_w800.webp");
    expect(html).toContain("/_next/image");
  });

  it("sin miniatura usa el original optimizado de siempre", () => {
    const html = render({ url: ORIGINAL });
    expect(html).toContain("/_next/image");
    expect(html).not.toContain("_w800.webp");
  });

  it("sin foto muestra el estado vacío", () => {
    expect(render(null)).toContain("Sin fotos");
  });
});

describe("PropertyGallery: tira de miniaturas", () => {
  it("la tira usa la miniatura y la foto principal pasa por el optimizador", () => {
    const html = renderToStaticMarkup(
      createElement(PropertyGallery, {
        title: "T",
        images: [
          { url: ORIGINAL, thumbnail_url: THUMB },
          { url: ORIGINAL.replace("abc", "def"), thumbnail_url: THUMB.replace("abc", "def") },
        ],
      })
    );
    expect(html).toContain("abc_w800.webp");
    expect(html).toContain("abc.jpg");
    expect(html).toContain("/_next/image");
  });
});
