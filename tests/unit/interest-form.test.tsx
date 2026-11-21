// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InterestForm from "@/portal/components/InterestForm";
import * as turnstileLib from "@/portal/lib/turnstile";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response("{}", { status: 202 }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(cleanup);

function setup() {
  render(
    <InterestForm
      tenant="inmobiliaria-demo"
      responsibleName="Inmobiliaria Demo"
      propertyCode={9}
      propertyTitle="Penthouse"
    />
  );
  const type = (label: RegExp | string, value: string) =>
    fireEvent.change(
      screen.getByLabelText(typeof label === "string" ? new RegExp("^" + label) : label),
      { target: { value } }
    );
  const submit = () => fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
  return { type, submit };
}

describe("InterestForm sin site key", () => {
  it("no pide Turnstile: sin línea legal ni turnstile_token en el cuerpo", async () => {
    const loadSpy = vi.spyOn(turnstileLib, "loadTurnstile");
    const { type, submit } = setup();
    expect(screen.queryByText(/Cloudflare Turnstile/)).toBeNull();
    fireEvent.focusIn(screen.getByLabelText(/^Nombre/));
    expect(loadSpy).not.toHaveBeenCalled();
    expect(document.querySelector('script[src*="challenges.cloudflare.com"]')).toBeNull();
    type("Nombre", "Ana Pérez");
    type(/Teléfono/, "3001234567");
    fireEvent.click(screen.getByLabelText(/Autorizo a/));
    submit();
    expect(await screen.findByText("¡Gracias por tu interés!")).toBeTruthy();
    const body = JSON.parse((fetchMock.mock.calls[0] as any)[1].body);
    expect(body).not.toHaveProperty("turnstile_token");
  });
});

describe("InterestForm en modo general (home)", () => {
  it("no pide correo y el consentimiento habla de la búsqueda", () => {
    render(
      <InterestForm
        tenant="inmobiliaria-demo"
        responsibleName="Inmobiliaria Demo"
        context="general"
      />
    );
    expect(screen.queryByLabelText(/Correo/)).toBeNull();
    expect(screen.getByText(/sobre mi búsqueda/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Escríbenos" })).toBeTruthy();
  });

  it("conserva el modo propiedad con correo y el inmueble", () => {
    render(
      <InterestForm
        tenant="inmobiliaria-demo"
        responsibleName="Inmobiliaria Demo"
        propertyTitle="Penthouse"
      />
    );
    expect(screen.getByLabelText(/Correo/)).toBeTruthy();
    expect(screen.getByText(/sobre este inmueble/)).toBeTruthy();
  });

  it("envía el lead general sin correo, sin propiedad y con su versión de consentimiento", async () => {
    render(
      <InterestForm
        tenant="inmobiliaria-demo"
        responsibleName="Inmobiliaria Demo"
        context="general"
      />
    );
    fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: "Ana Pérez" } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: "3001234567" } });
    fireEvent.click(screen.getByLabelText(/Autorizo a/));
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    expect(await screen.findByText("¡Gracias por tu interés!")).toBeTruthy();
    const body = JSON.parse((fetchMock.mock.calls[0] as any)[1].body);
    expect(body).not.toHaveProperty("email");
    expect(body).not.toHaveProperty("property_code");
    expect(body).not.toHaveProperty("message");
    expect(body.consent_version).toBe("2.1");
  });

  it("dos formularios en la misma página no repiten ids", () => {
    render(
      <>
        <InterestForm tenant="a" responsibleName="Agencia A" context="general" />
        <InterestForm tenant="b" responsibleName="Agencia B" propertyTitle="Casa" />
      </>
    );
    const ids = [...document.querySelectorAll("input[id], textarea[id]")].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    const labels = [...document.querySelectorAll("label[for]")];
    for (const label of labels) {
      expect(document.getElementById(label.getAttribute("for")!)).toBeTruthy();
    }
  });

  it("los errores quedan enlazados al campo que los produce", async () => {
    render(<InterestForm tenant="a" responsibleName="Agencia A" />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    const name = screen.getByLabelText(/^Nombre/);
    await waitFor(() => expect(name.getAttribute("aria-describedby")).toBeTruthy());
    const error = document.getElementById(name.getAttribute("aria-describedby")!);
    expect(error?.getAttribute("role")).toBe("alert");
    expect(name.getAttribute("aria-invalid")).toBe("true");
  });

  it("lleva el foco al primer campo inválido y al mensaje de éxito", async () => {
    const { type, submit } = setup();
    submit();
    const name = screen.getByLabelText(/^Nombre/);
    await waitFor(() => expect(document.activeElement).toBe(name));

    type("Nombre", "Ana Pérez");
    type(/Teléfono/, "3001234567");
    fireEvent.click(screen.getByLabelText(/Autorizo a/));
    submit();
    const success = await screen.findByRole("status");
    await waitFor(() => expect(document.activeElement).toBe(success));
  });
});

describe("InterestForm (esquema zod)", () => {
  it("el consentimiento está sin marcar por defecto y es obligatorio", async () => {
    const { type, submit } = setup();
    expect((screen.getByLabelText(/Autorizo a/) as HTMLInputElement).checked).toBe(false);
    type("Nombre", "Ana Pérez");
    type(/Teléfono/, "3001234567");
    submit();
    expect(await screen.findByText(/Debes autorizar el tratamiento/)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("vacío: errores de nombre, teléfono y consentimiento", async () => {
    const { submit } = setup();
    submit();
    expect(await screen.findByText("Escribe tu nombre")).toBeTruthy();
    expect(screen.getByText("Escribe un teléfono válido")).toBeTruthy();
    expect(screen.getByText(/Debes autorizar/)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rechaza mensajes de más de 1000 caracteres", async () => {
    const { type, submit } = setup();
    type("Nombre", "Ana Pérez");
    type(/Teléfono/, "3001234567");
    type(/Mensaje/, "x".repeat(1001));
    fireEvent.click(screen.getByLabelText(/Autorizo a/));
    submit();
    expect(await screen.findByText("Máximo 1000 caracteres")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("valida teléfono con letras y correo inválido", async () => {
    const { type, submit } = setup();
    type("Nombre", "Ana Pérez");
    type(/Teléfono/, "abcdefgh");
    type(/Correo/, "mal");
    fireEvent.click(screen.getByLabelText(/Autorizo a/));
    submit();
    expect(await screen.findByText("Usa solo números, espacios o +")).toBeTruthy();
    expect(screen.getByText("Correo no válido")).toBeTruthy();
  });

  it("datos válidos: envía el payload esperado y muestra éxito", async () => {
    const { type, submit } = setup();
    type("Nombre", "Ana Pérez");
    type(/Teléfono/, "+57 300 123 4567");
    fireEvent.click(screen.getByLabelText(/Autorizo a/));
    submit();

    expect(await screen.findByText("¡Gracias por tu interés!")).toBeTruthy();
    const [url, init] = fetchMock.mock.calls[0] as any;
    expect(url).toBe("/api/portal/leads");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      slug: "inmobiliaria-demo",
      property_code: 9,
      name: "Ana Pérez",
      phone: "+57 300 123 4567",
      consent: true,
      consent_version: "2.0",
      marketing_consent: false,
      website: "",
    });
    expect(body.email).toBeUndefined();
    expect(body.message).toBe('Hola, me interesa "Penthouse".');
    expect(typeof body.elapsed_ms).toBe("number");
  });

  it("429 muestra el aviso de límite y 500 el de error", async () => {
    for (const [status, text] of [
      [429, /Has enviado varias solicitudes/],
      [502, /No pudimos enviar tu mensaje/],
    ] as const) {
      cleanup();
      fetchMock.mockResolvedValueOnce(new Response("{}", { status }));
      const { type, submit } = setup();
      type("Nombre", "Ana Pérez");
      type(/Teléfono/, "3001234567");
      fireEvent.click(screen.getByLabelText(/Autorizo a/));
      submit();
      await waitFor(() => expect(screen.getByText(text)).toBeTruthy());
    }
  });
});
