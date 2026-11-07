// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InterestForm from "@/portal/components/InterestForm";
import type { TurnstileApi, TurnstileRenderOptions } from "@/portal/lib/turnstile";

const loadMock = vi.hoisted(() => vi.fn());

vi.mock("@/portal/lib/turnstile", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/portal/lib/turnstile")>()),
  loadTurnstile: loadMock,
}));

const SITE_KEY = "1x00000000000000000000AA";

let fetchMock: ReturnType<typeof vi.fn>;
let opts: TurnstileRenderOptions;
type Fn = ReturnType<typeof vi.fn>;
let api: { render: Fn; reset: Fn; remove: Fn };

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", SITE_KEY);
  fetchMock = vi.fn(async () => new Response("{}", { status: 202 }));
  vi.stubGlobal("fetch", fetchMock);
  api = {
    render: vi.fn((_el: unknown, o: TurnstileRenderOptions) => {
      opts = o;
      return "widget-1";
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  loadMock.mockReset();
  loadMock.mockResolvedValue(api as unknown as TurnstileApi);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(cleanup);

function setup() {
  const view = render(
    <InterestForm tenant="inmobiliaria-demo" responsibleName="Inmobiliaria Demo" propertyCode={9} />
  );
  const type = (label: RegExp | string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  const fillAll = () => {
    type("Nombre", "Ana Pérez");
    type(/Teléfono/, "3001234567");
    fireEvent.click(screen.getByLabelText(/Autorizo a/));
  };
  const submit = () => fireEvent.click(screen.getByRole("button", { name: /Enviar|Verificando/ }));
  const startWidget = async () => {
    fireEvent.focusIn(screen.getByLabelText("Nombre"));
    await waitFor(() => expect(api.render).toHaveBeenCalled());
  };
  return { view, fillAll, submit, startWidget };
}

const bodyOf = (i = 0) => JSON.parse((fetchMock.mock.calls[i] as any)[1].body);

describe("InterestForm con Turnstile", () => {
  it("el script se carga en el primer foco del formulario, no al montar", async () => {
    const { startWidget } = setup();
    expect(loadMock).not.toHaveBeenCalled();
    await startWidget();
    expect(loadMock).toHaveBeenCalledTimes(1);
  });

  it("también se carga con pointerdown, una sola vez", async () => {
    setup();
    fireEvent.pointerDown(screen.getByLabelText("Nombre"));
    fireEvent.pointerDown(screen.getByLabelText(/Teléfono/));
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    expect(loadMock).toHaveBeenCalledTimes(1);
    expect(api.render).toHaveBeenCalledTimes(1);
  });

  it("renderiza con las opciones del plan", async () => {
    const { startWidget } = setup();
    await startWidget();
    expect(opts).toMatchObject({
      sitekey: SITE_KEY,
      action: "portal-lead",
      appearance: "interaction-only",
      size: "flexible",
      theme: "light",
      language: "es",
      "response-field": false,
      "refresh-expired": "auto",
      "refresh-timeout": "auto",
      retry: "auto",
    });
  });

  it("con token disponible el cuerpo lleva turnstile_token", async () => {
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    act(() => opts.callback?.("tok-1"));
    fillAll();
    submit();
    expect(await screen.findByText("¡Gracias por tu interés!")).toBeTruthy();
    expect(bodyOf().turnstile_token).toBe("tok-1");
  });

  it("enviar antes del token muestra 'Verificando…' y envía cuando llega", async () => {
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    fillAll();
    submit();
    expect(await screen.findByRole("button", { name: "Verificando…" })).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => opts.callback?.("tok-late"));
    expect(await screen.findByText("¡Gracias por tu interés!")).toBeTruthy();
    expect(bodyOf().turnstile_token).toBe("tok-late");
  });

  it("si el widget aún no arrancó, el envío lo inicia y espera el token", async () => {
    const { fillAll, submit } = setup();
    fillAll();
    submit();
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    act(() => opts.callback?.("tok-x"));
    expect(await screen.findByText("¡Gracias por tu interés!")).toBeTruthy();
  });

  it("token expirado: espera el nuevo y no manda el viejo", async () => {
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    act(() => opts.callback?.("tok-old"));
    act(() => opts["expired-callback"]?.());
    fillAll();
    submit();
    expect(await screen.findByRole("button", { name: "Verificando…" })).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => opts.callback?.("tok-new"));
    await screen.findByText("¡Gracias por tu interés!");
    expect(bodyOf().turnstile_token).toBe("tok-new");
  });

  it("si el script no carga: mensaje visible y fetch no se llama", async () => {
    loadMock.mockRejectedValue(new Error("bloqueado"));
    const { fillAll, submit } = setup();
    fillAll();
    submit();
    const alert = await screen.findByText(/No pudimos cargar la verificación de seguridad/);
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert.textContent).toContain("WhatsApp");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tras fallar la carga, el siguiente intento vuelve a pedir el script", async () => {
    loadMock.mockRejectedValueOnce(new Error("bloqueado"));
    const { fillAll, submit } = setup();
    fillAll();
    submit();
    await screen.findByText(/No pudimos cargar la verificación/);
    submit();
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    expect(loadMock).toHaveBeenCalledTimes(2);
    act(() => opts.callback?.("tok-retry"));
    await screen.findByText("¡Gracias por tu interés!");
  });

  it("error-callback 300010 -> mensaje de navegador; devuelve true (manejado)", async () => {
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    fillAll();
    submit();
    await screen.findByRole("button", { name: "Verificando…" });
    let handled: unknown;
    act(() => {
      handled = opts["error-callback"]?.("300010");
    });
    expect(handled).toBe(true);
    expect(await screen.findByText(/No pudimos verificar tu navegador/)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("error-callback 110100 -> mensaje de configuración y console.warn", async () => {
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    fillAll();
    submit();
    await screen.findByRole("button", { name: "Verificando…" });
    act(() => {
      opts["error-callback"]?.("110100");
    });
    expect(await screen.findByText(/La verificación de seguridad no está disponible/)).toBeTruthy();
    expect(console.warn).toHaveBeenCalled();
  });

  it("error-callback 100xxx -> mensaje genérico", async () => {
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    fillAll();
    submit();
    await screen.findByRole("button", { name: "Verificando…" });
    act(() => {
      opts["error-callback"]?.("100001");
    });
    expect(await screen.findByText(/Hubo un problema con la verificación/)).toBeTruthy();
  });

  it("unsupported-callback -> mensaje de navegador; timeout-callback -> 'tardó demasiado'", async () => {
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    fillAll();
    submit();
    await screen.findByRole("button", { name: "Verificando…" });
    act(() => opts["unsupported-callback"]?.());
    expect(await screen.findByText(/No pudimos verificar tu navegador/)).toBeTruthy();

    submit();
    await screen.findByRole("button", { name: "Verificando…" });
    act(() => opts["timeout-callback"]?.());
    expect(await screen.findByText(/La verificación tardó demasiado/)).toBeTruthy();
  });

  describe("token envejecido", () => {
    afterEach(() => vi.useRealTimers());

    it("con más de 240 s se reinicia el widget y se envía el token nuevo", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      const { fillAll, submit, startWidget } = setup();
      await startWidget();
      act(() => opts.callback?.("tok-viejo"));
      fillAll();
      vi.advanceTimersByTime(241_000);
      submit();
      await waitFor(() => expect(api.reset).toHaveBeenCalledWith("widget-1"));
      expect(fetchMock).not.toHaveBeenCalled();
      act(() => opts.callback?.("tok-nuevo"));
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(bodyOf().turnstile_token).toBe("tok-nuevo");
    });

    it("con menos de 240 s se usa el token vigente sin reiniciar", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      const { fillAll, submit, startWidget } = setup();
      await startWidget();
      act(() => opts.callback?.("tok-1"));
      fillAll();
      vi.advanceTimersByTime(200_000);
      submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(api.reset).not.toHaveBeenCalled();
      expect(bodyOf().turnstile_token).toBe("tok-1");
    });

    it("si isExpired lo indica se reinicia aunque el token sea reciente", async () => {
      const { fillAll, submit, startWidget } = setup();
      await startWidget();
      (api as unknown as { isExpired: Fn }).isExpired = vi.fn(() => true);
      act(() => opts.callback?.("tok-viejo"));
      fillAll();
      submit();
      await waitFor(() => expect(api.reset).toHaveBeenCalledWith("widget-1"));
      expect(fetchMock).not.toHaveBeenCalled();
      act(() => opts.callback?.("tok-nuevo"));
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(bodyOf().turnstile_token).toBe("tok-nuevo");
    });
  });

  it("el texto del desafío interactivo vive en una región aria-live", async () => {
    const { startWidget } = setup();
    await startWidget();
    act(() => opts["before-interactive-callback"]?.());
    const text = await screen.findByText(/Marca la casilla/);
    expect(text.closest('[aria-live="polite"]')).not.toBeNull();
  });

  it.each([502, 429, 400])(
    "respuesta %i -> el widget se reinicia una vez y el segundo envío usa el token nuevo",
    async (status) => {
      fetchMock.mockResolvedValueOnce(new Response("{}", { status }));
      const { fillAll, submit, startWidget } = setup();
      await startWidget();
      act(() => opts.callback?.("tok-1"));
      fillAll();
      submit();
      await waitFor(() => expect(api.reset).toHaveBeenCalledTimes(1));
      expect(api.reset).toHaveBeenCalledWith("widget-1");

      // El token se consumió: el envío siguiente espera el nuevo
      submit();
      await screen.findByRole("button", { name: "Verificando…" });
      act(() => opts.callback?.("tok-2"));
      await screen.findByText("¡Gracias por tu interés!");
      expect(bodyOf(0).turnstile_token).toBe("tok-1");
      expect(bodyOf(1).turnstile_token).toBe("tok-2");
    }
  );

  it("fallo de red también reinicia el widget", async () => {
    fetchMock.mockRejectedValueOnce(new Error("down"));
    const { fillAll, submit, startWidget } = setup();
    await startWidget();
    act(() => opts.callback?.("tok-1"));
    fillAll();
    submit();
    await screen.findByText(/No pudimos enviar tu mensaje/);
    expect(api.reset).toHaveBeenCalledTimes(1);
  });

  it("202 muestra éxito y al desmontar se elimina el widget", async () => {
    const { view, fillAll, submit, startWidget } = setup();
    await startWidget();
    act(() => opts.callback?.("tok-1"));
    fillAll();
    submit();
    await screen.findByText("¡Gracias por tu interés!");
    expect(api.reset).not.toHaveBeenCalled();
    view.unmount();
    expect(api.remove).toHaveBeenCalledWith("widget-1");
  });

  it("accesibilidad: región aria-live, errores con role=alert y línea legal con enlace a /privacidad", async () => {
    const { view, startWidget } = setup();
    await startWidget();
    const live = view.container.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();
    expect(live?.className).toContain("sr-only");
    expect(live?.textContent).toBe("Verificando que eres una persona…");
    act(() => opts.callback?.("tok"));
    await waitFor(() => expect(live?.textContent).toBe("Verificación completada"));

    const legal = screen.getByText(/protegido por Cloudflare Turnstile/);
    const link = legal.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/privacidad");
  });

  it("desafío interactivo: muestra la indicación mientras no hay token", async () => {
    const { startWidget } = setup();
    await startWidget();
    act(() => opts["before-interactive-callback"]?.());
    expect(screen.getByText("Marca la casilla para confirmar que eres una persona.")).toBeTruthy();
    act(() => opts.callback?.("tok"));
    expect(screen.queryByText("Marca la casilla para confirmar que eres una persona.")).toBeNull();
  });
});
