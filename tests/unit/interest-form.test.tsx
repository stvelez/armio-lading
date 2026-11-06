// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InterestForm from "@/portal/components/InterestForm";

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
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  const submit = () => fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
  return { type, submit };
}

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
      consent_version: "1.0",
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
