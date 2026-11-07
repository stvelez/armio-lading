// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { Activity, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Beacon = typeof import("@/portal/components/VisitBeacon").default;
let VisitBeacon: Beacon;

let beacon: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn>;

const setReferrer = (value: string) =>
  Object.defineProperty(document, "referrer", { value, configurable: true });
const setVisibility = (state: "visible" | "hidden") =>
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
const setUrl = (url: string) => window.history.replaceState(null, "", url);
const sent = () => beacon.mock.calls.map((c) => JSON.parse(c[1] as string));

beforeEach(async () => {
  // El estado del módulo (firstViewSent) debe reiniciarse como en una carga completa del documento
  vi.resetModules();
  VisitBeacon = (await import("@/portal/components/VisitBeacon")).default;
  beacon = vi.fn(() => true);
  fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
  Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(navigator, "webdriver", { value: false, configurable: true });
  setReferrer("");
  setVisibility("visible");
  setUrl("/");
  window.sessionStorage.clear();
  Object.defineProperty(document, "prerendering", { value: false, configurable: true });
});
afterEach(() => {
  cleanup();
  delete (document as unknown as Record<string, unknown>).prerendering;
});

describe("VisitBeacon", () => {
  it("renderiza null", () => {
    const { container } = render(<VisitBeacon page="home" />);
    expect(container.innerHTML).toBe("");
  });

  it("envía una vez al montar con sendBeacon a /api/portal/visits", () => {
    render(<VisitBeacon page="property" code={9} />);
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toBe("/api/portal/visits");
    expect(sent()[0]).toEqual({ page: "property", code: 9, source: "directo" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clasifica el referrer y manda UTM saneadas, nunca el referrer ni la URL", () => {
    setReferrer("https://l.facebook.com/l.php?u=https%3A%2F%2Fsecreto.co%2F");
    setUrl("/propiedades?utm_source=Meta&utm_medium=Compartir%20Ya&utm_campaign=a@b.com&token=zzz");
    render(<VisitBeacon page="listing" />);
    const body = beacon.mock.calls[0][1] as string;
    expect(sent()[0]).toEqual({
      page: "listing",
      source: "facebook",
      utm_source: "meta",
      utm_medium: "compartir-ya",
    });
    expect(body).not.toContain("secreto");
    expect(body).not.toContain("l.facebook.com");
    expect(body).not.toContain("token");
    expect(body).not.toContain("localhost");
    expect(body).not.toContain("a@b.com");
  });

  it("fallback a fetch keepalive si no hay sendBeacon", () => {
    Object.defineProperty(navigator, "sendBeacon", { value: undefined, configurable: true });
    render(<VisitBeacon page="home" />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/portal/visits");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
  });

  it("fallback a fetch si sendBeacon devuelve false", () => {
    beacon.mockReturnValue(false);
    render(<VisitBeacon page="home" />);
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sendBeacon que lanza no rompe el render (usa fetch)", () => {
    beacon.mockImplementation(() => {
      throw new Error("boom");
    });
    expect(() => render(<VisitBeacon page="home" />)).not.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("si fetch también lanza o rechaza, no rompe", async () => {
    beacon.mockReturnValue(false);
    fetchMock.mockImplementation(() => {
      throw new Error("sync");
    });
    expect(() => render(<VisitBeacon page="home" />)).not.toThrow();
    cleanup();
    fetchMock.mockImplementation(() => Promise.reject(new Error("async")));
    expect(() => render(<VisitBeacon page="home" />)).not.toThrow();
    await Promise.resolve();
  });

  describe("pestaña en segundo plano", () => {
    it("no envía hasta que se vea", () => {
      setVisibility("hidden");
      render(<VisitBeacon page="home" />);
      expect(beacon).not.toHaveBeenCalled();
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
      expect(beacon).toHaveBeenCalledTimes(1);
      document.dispatchEvent(new Event("visibilitychange"));
      expect(beacon).toHaveBeenCalledTimes(1);
    });

    it("desmontada antes de verse nunca envía", () => {
      setVisibility("hidden");
      const { unmount } = render(<VisitBeacon page="home" />);
      unmount();
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
      expect(beacon).not.toHaveBeenCalled();
    });

    it("un cambio a oculto no cuenta", () => {
      setVisibility("hidden");
      render(<VisitBeacon page="home" />);
      document.dispatchEvent(new Event("visibilitychange"));
      expect(beacon).not.toHaveBeenCalled();
    });
  });

  describe("prerender", () => {
    it("espera a prerenderingchange", () => {
      Object.defineProperty(document, "prerendering", { value: true, configurable: true });
      render(<VisitBeacon page="home" />);
      expect(beacon).not.toHaveBeenCalled();
      Object.defineProperty(document, "prerendering", { value: false, configurable: true });
      document.dispatchEvent(new Event("prerenderingchange"));
      expect(beacon).toHaveBeenCalledTimes(1);
    });

    it("desmontada durante el prerender nunca envía", () => {
      Object.defineProperty(document, "prerendering", { value: true, configurable: true });
      const { unmount } = render(<VisitBeacon page="home" />);
      unmount();
      document.dispatchEvent(new Event("prerenderingchange"));
      expect(beacon).not.toHaveBeenCalled();
    });
  });

  describe("bots y automatización", () => {
    it("navigator.webdriver", () => {
      Object.defineProperty(navigator, "webdriver", { value: true, configurable: true });
      render(<VisitBeacon page="home" />);
      expect(beacon).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(["Googlebot/2.1", "HeadlessChrome/120", "Lighthouse", "curl/8.4"])("UA %s", (ua) => {
      vi.spyOn(navigator, "userAgent", "get").mockReturnValue(ua);
      render(<VisitBeacon page="home" />);
      expect(beacon).not.toHaveBeenCalled();
    });
  });

  describe("tráfico del equipo (#equipo-armio)", () => {
    it("no envía, guarda el flag y quita el hash", () => {
      setUrl("/propiedades/9-x?a=1#equipo-armio");
      render(<VisitBeacon page="property" code={9} />);
      expect(beacon).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem("armio:equipo")).toBe("1");
      expect(window.location.hash).toBe("");
      expect(window.location.pathname + window.location.search).toBe("/propiedades/9-x?a=1");
    });

    it("el siguiente montaje en la misma pestaña tampoco envía", () => {
      setUrl("/#equipo-armio");
      const first = render(<VisitBeacon page="home" />);
      first.unmount();
      render(<VisitBeacon page="listing" />);
      expect(beacon).not.toHaveBeenCalled();
    });

    it("sin sessionStorage utilizable igual quita el hash y no envía", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("bloqueado");
      });
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("bloqueado");
      });
      setUrl("/#equipo-armio");
      render(<VisitBeacon page="home" />);
      expect(beacon).not.toHaveBeenCalled();
      expect(window.location.hash).toBe("");
    });

    it("sin el hash ni el flag cuenta normal", () => {
      render(<VisitBeacon page="home" />);
      expect(beacon).toHaveBeenCalledTimes(1);
    });
  });

  describe("navegación dentro del documento", () => {
    it("la segunda vista es 'interno' y sin UTM", () => {
      setReferrer("https://www.google.com/");
      setUrl("/?utm_source=whatsapp&utm_campaign=nov");
      const first = render(<VisitBeacon page="home" />);
      first.unmount();
      setUrl("/propiedades/9-x");
      render(<VisitBeacon page="property" code={9} />);
      expect(sent()).toEqual([
        { page: "home", source: "whatsapp", utm_source: "whatsapp", utm_campaign: "nov" },
        { page: "property", code: 9, source: "interno" },
      ]);
    });

    it("cambiar el código en la misma instancia cuenta una vista nueva; re-render igual no", () => {
      const { rerender } = render(<VisitBeacon page="property" code={9} />);
      rerender(<VisitBeacon page="property" code={9} />);
      expect(beacon).toHaveBeenCalledTimes(1);
      rerender(<VisitBeacon page="property" code={10} />);
      expect(beacon).toHaveBeenCalledTimes(2);
      expect(sent()[1]).toEqual({ page: "property", code: 10, source: "interno" });
    });
  });

  it("StrictMode (doble montaje) envía una sola vez", () => {
    render(
      <StrictMode>
        <VisitBeacon page="home" />
      </StrictMode>
    );
    expect(beacon).toHaveBeenCalledTimes(1);
  });

  it("StrictMode con pestaña oculta tampoco envía doble al verse", () => {
    setVisibility("hidden");
    render(
      <StrictMode>
        <VisitBeacon page="home" />
      </StrictMode>
    );
    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(beacon).toHaveBeenCalledTimes(1);
  });

  describe("<Activity> oculto/visible (Next 16)", () => {
    const tree = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <VisitBeacon page="property" code={9} />
      </Activity>
    );

    afterEach(() => {
      vi.useRealTimers();
    });

    it("al volver a la misma página tras más de 1 s, cuenta otra vez", () => {
      vi.useFakeTimers();
      const { rerender } = render(tree("visible"));
      expect(beacon).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(5000);
      rerender(tree("hidden")); // los efectos se limpian
      vi.advanceTimersByTime(5000);
      rerender(tree("visible")); // los efectos se vuelven a montar
      expect(beacon).toHaveBeenCalledTimes(2);
      expect(sent()[1]).toEqual({ page: "property", code: 9, source: "interno" });
    });

    it("un ocultar/mostrar en menos de 1 s (como el doble montaje) no reenvía", () => {
      vi.useFakeTimers();
      const { rerender } = render(tree("visible"));
      vi.advanceTimersByTime(300);
      rerender(tree("hidden"));
      rerender(tree("visible"));
      expect(beacon).toHaveBeenCalledTimes(1);
    });

    it("StrictMode con timers falsos sigue enviando una sola vez", () => {
      vi.useFakeTimers();
      render(
        <StrictMode>
          <VisitBeacon page="home" />
        </StrictMode>
      );
      expect(beacon).toHaveBeenCalledTimes(1);
    });
  });
});
