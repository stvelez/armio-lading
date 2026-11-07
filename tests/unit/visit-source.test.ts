import { describe, expect, it } from "vitest";
import { BOT_UA, classifyVisitSource, sanitizeUtm, VISIT_SOURCES } from "@/portal/lib/visit-source";

const HOST = "inmobiliaria-demo.armio.co";
const classify = (referrer: string, utm?: string | null, host = HOST) =>
  classifyVisitSource(referrer, host, utm);

describe("classifyVisitSource", () => {
  it("expone las 7 categorías", () => {
    expect(VISIT_SOURCES).toEqual([
      "directo",
      "buscador",
      "whatsapp",
      "facebook",
      "instagram",
      "otro_sitio",
      "interno",
    ]);
  });

  it.each([
    ["", "directo"],
    ["   ", "directo"],
    ["not a url", "directo"],
    ["javascript:alert(1)", "otro_sitio"],
    ["data:text/html,<script>alert(1)</script>", "otro_sitio"],
    ["file:///etc/passwd", "otro_sitio"],
    ["ftp://google.com/", "otro_sitio"],
  ])("referrer ilegible o no web %j -> %s", (referrer, expected) => {
    expect(classify(referrer)).toBe(expected);
  });

  it("null/undefined -> directo", () => {
    expect(classifyVisitSource(null, HOST)).toBe("directo");
    expect(classifyVisitSource(undefined, HOST)).toBe("directo");
  });

  it.each([
    "https://www.google.com/",
    "https://www.google.com.co/",
    "https://google.co.uk/",
    "https://google.es/search?q=x",
    "https://www.bing.com/",
    "https://duckduckgo.com/",
    "https://search.yahoo.com/",
    "https://yandex.ru/",
    "https://www.ecosia.org/",
    "https://search.brave.com/",
  ])("buscador: %s", (r) => expect(classify(r)).toBe("buscador"));

  it.each([
    "https://google.com.evil.co/",
    "https://evilgoogle.com/",
    "https://google.evil.com/",
    "https://notbing.com/",
    "https://yahoo.com/",
    "https://bing.com.attacker.io/",
  ])("falsos buscadores: %s -> otro_sitio", (r) => expect(classify(r)).toBe("otro_sitio"));

  it.each([
    "https://l.facebook.com/l.php?u=https%3A%2F%2Fx.co",
    "https://lm.facebook.com/",
    "https://m.facebook.com/",
    "https://fb.me/x",
    "https://www.messenger.com/",
  ])("facebook: %s", (r) => expect(classify(r)).toBe("facebook"));

  it.each(["https://facebook.com.attacker.io/", "https://notfacebook.com/"])(
    "falso facebook: %s -> otro_sitio",
    (r) => expect(classify(r)).toBe("otro_sitio")
  );

  it("instagram y whatsapp", () => {
    expect(classify("https://l.instagram.com/?u=x")).toBe("instagram");
    expect(classify("https://instagram.com/")).toBe("instagram");
    expect(classify("https://web.whatsapp.com/")).toBe("whatsapp");
    expect(classify("https://wa.me/573001234567")).toBe("whatsapp");
    expect(classify("https://instagram.com.evil.co/")).toBe("otro_sitio");
  });

  it("apps de Android", () => {
    expect(classify("android-app://com.whatsapp/")).toBe("whatsapp");
    expect(classify("android-app://com.whatsapp.w4b/")).toBe("whatsapp");
    expect(classify("android-app://com.facebook.katana/")).toBe("facebook");
    expect(classify("android-app://com.instagram.android/")).toBe("instagram");
    expect(classify("android-app://com.google.android.googlequicksearchbox/")).toBe("buscador");
    expect(classify("android-app://com.google.android.gm/")).toBe("otro_sitio");
    expect(classify("android-app://com.evil/")).toBe("otro_sitio");
  });

  it("mismo host (otro puerto, mayúsculas, punto final) -> interno", () => {
    expect(classify("https://inmobiliaria-demo.armio.co/propiedades")).toBe("interno");
    expect(
      classify(
        "http://Inmobiliaria-Demo.localhost:3001/x",
        null,
        "inmobiliaria-demo.localhost:3000"
      )
    ).toBe("interno");
    expect(classify("https://INMOBILIARIA-DEMO.ARMIO.CO./x")).toBe("interno");
  });

  it("otro portal de armio.co es otro_sitio", () => {
    expect(classify("https://otra.armio.co/")).toBe("otro_sitio");
    expect(classify("https://armio.co/")).toBe("otro_sitio");
  });

  it("otros sitios", () => {
    expect(classify("https://elpais.com.co/nota")).toBe("otro_sitio");
  });

  describe("precedencia de utm_source", () => {
    it("utm_source=whatsapp gana al referrer de Google", () => {
      expect(classify("https://www.google.com/", "whatsapp")).toBe("whatsapp");
    });
    it("utm reconocidas", () => {
      expect(classify("", "wa")).toBe("whatsapp");
      expect(classify("", "FB")).toBe("facebook");
      expect(classify("", "meta")).toBe("facebook");
      expect(classify("", "ig")).toBe("instagram");
      expect(classify("", "Google")).toBe("buscador");
      expect(classify("", "bing")).toBe("buscador");
    });
    it("utm desconocida o hostil se ignora y manda el referrer", () => {
      expect(classify("https://www.google.com/", "desconocido")).toBe("buscador");
      expect(classify("", "desconocido")).toBe("directo");
      expect(classify("https://l.facebook.com/", "a@b.com")).toBe("facebook");
    });
  });
});

describe("sanitizeUtm", () => {
  it("normaliza mayúsculas y espacios", () => {
    expect(sanitizeUtm("WhatsApp")).toBe("whatsapp");
    expect(sanitizeUtm("  Nov 2026  ")).toBe("nov-2026");
    expect(sanitizeUtm("a.b_c-d")).toBe("a.b_c-d");
    expect(sanitizeUtm("a".repeat(40))).toBe("a".repeat(40));
    expect(sanitizeUtm("123456")).toBe("123456");
  });

  it.each([
    "a@b.com",
    "3001234567",
    "a".repeat(41),
    "../",
    "%3Cscript%3E",
    "😀",
    "<script>",
    "a/b",
    "x:y",
    "-inicio",
    "",
    "   ",
  ])("descarta %j", (v) => expect(sanitizeUtm(v)).toBeNull());

  it("null/undefined", () => {
    expect(sanitizeUtm(null)).toBeNull();
    expect(sanitizeUtm(undefined)).toBeNull();
  });
});

describe("BOT_UA", () => {
  it("detecta bots y herramientas, no navegadores", () => {
    for (const ua of [
      "Googlebot/2.1",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
      "facebookexternalhit/1.1",
      "WhatsApp/2.23",
      "HeadlessChrome/120",
      "curl/8",
      "python-requests/2",
    ]) {
      expect(BOT_UA.test(ua), ua).toBe(true);
    }
    expect(
      BOT_UA.test(
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36"
      )
    ).toBe(false);
  });

  it("no descarta teléfonos Cubot (CUBOT_X50)", () => {
    expect(
      BOT_UA.test(
        "Mozilla/5.0 (Linux; Android 10; CUBOT_X50) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36"
      )
    ).toBe(false);
    expect(BOT_UA.test("Mozilla/5.0 (Linux; Android 9; Cubot P40)")).toBe(false);
  });
});
