import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guardia estática: las páginas del portal deben seguir siendo estáticas/ISR. Cualquier API dinámica
 * (`headers()`, `cookies()`, `connection()`) las volvería dinámicas; el contador de visitas vive en el cliente.
 */

const ROOT = path.resolve(__dirname, "../../src/app/(portal)/p/[tenant]");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(ROOT).filter((f) => /(^|\/)(page|layout)\.tsx$/.test(f));

describe("páginas del portal", () => {
  it("encuentra las páginas y layouts esperados", () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it.each(files.map((f) => [path.relative(ROOT, f), f]))(
    "%s no usa next/headers ni APIs dinámicas",
    (_name, file) => {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/next\/headers/);
      expect(source).not.toMatch(/\bcookies\s*\(/);
      expect(source).not.toMatch(/\bheaders\s*\(/);
      expect(source).not.toMatch(/\bconnection\s*\(/);
    }
  );

  it("inicio, listado y ficha montan VisitBeacon con el page correcto", () => {
    const read = (p: string) => readFileSync(path.join(ROOT, p), "utf8");
    expect(read("page.tsx")).toContain('<VisitBeacon page="home" />');
    expect(read("propiedades/page.tsx")).toContain('<VisitBeacon page="listing" />');
    expect(read("propiedades/[property]/page.tsx")).toContain(
      '<VisitBeacon page="property" code={property.code} />'
    );
  });

  it("privacidad no monta el contador", () => {
    expect(readFileSync(path.join(ROOT, "privacidad/page.tsx"), "utf8")).not.toContain(
      "VisitBeacon"
    );
  });

  it("VisitBeacon es de cliente y no usa usePathname/useSearchParams", () => {
    const source = readFileSync(
      path.resolve(__dirname, "../../src/portal/components/VisitBeacon.tsx"),
      "utf8"
    );
    expect(source.trimStart().startsWith('"use client"')).toBe(true);
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/usePathname|useSearchParams|next\/navigation|next\/headers/);
  });

  /**
   * D-1: Google Analytics vive EXCLUSIVAMENTE en `(marketing)`. El portal es otro origen, con su
   * propio `<html>`, y su único conteo es `VisitBeacon` (propio, agregado y anónimo). Esta guardia
   * falla si alguien importa GA/gtag en el árbol del portal, lo que además dejaría en falso el
   * aviso de `/privacidad` («no hay Google Analytics ni píxeles de redes sociales»).
   */
  it("el portal no monta analítica de terceros", () => {
    const sources = walk(path.resolve(__dirname, "../../src/portal"))
      .concat(files)
      .map((f) => `/* ${f} */\n${readFileSync(f, "utf8")}`)
      .join("\n");
    expect(sources).not.toMatch(/GoogleAnalytics|AnalyticsGate|gtag|googletagmanager/);
  });

  it("el layout de marketing es el único que monta AnalyticsGate", () => {
    const marketing = readFileSync(
      path.resolve(__dirname, "../../src/app/(marketing)/layout.tsx"),
      "utf8"
    );
    expect(marketing).toContain("AnalyticsGate");
  });
});
