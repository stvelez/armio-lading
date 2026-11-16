// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import { CONSENT_KEY, PORTAL_NOTICE_KEY } from "@/lib/consent";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

describe("CookieConsentBanner — variante de consentimiento (marketing)", () => {
  it("no renderiza nada si ya hay decisión guardada", () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    const { container } = render(<CookieConsentBanner />);
    expect(container.innerHTML).toBe("");
  });

  it("renderiza el aviso y sus dos botones sin decisión", () => {
    render(<CookieConsentBanner />);
    expect(screen.getByRole("region", { name: "Aviso de cookies" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rechazar" })).toBeTruthy();
  });

  it("Aceptar guarda 'accepted' y oculta el aviso", () => {
    const { container } = render(<CookieConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(localStorage.getItem(CONSENT_KEY)).toBe("accepted");
    expect(container.innerHTML).toBe("");
  });

  it("Rechazar guarda 'rejected' y oculta el aviso", () => {
    const { container } = render(<CookieConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(localStorage.getItem(CONSENT_KEY)).toBe("rejected");
    expect(container.innerHTML).toBe("");
  });

  it("enlaza la política de cookies", () => {
    render(<CookieConsentBanner />);
    const link = screen.getByRole("link", { name: "Política de cookies" });
    expect(link.getAttribute("href")).toBe("https://armio.co/cookies");
  });
});

describe("CookieConsentBanner — variante informativa (portal)", () => {
  it("usa su propia clave: la decisión de marketing no lo oculta", () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    render(<CookieConsentBanner variant="notice" />);
    expect(screen.getByRole("region", { name: "Aviso de cookies" })).toBeTruthy();
  });

  it("no pide consentimiento de analítica ni menciona Google Analytics", () => {
    const { container } = render(<CookieConsentBanner variant="notice" />);
    expect(screen.queryByRole("button", { name: "Aceptar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Rechazar" })).toBeNull();
    expect(screen.getByRole("button", { name: "Entendido" })).toBeTruthy();
    expect(container.textContent).not.toMatch(/Google Analytics/);
  });

  it("«Entendido» guarda la clave del portal y oculta el aviso", () => {
    const { container } = render(<CookieConsentBanner variant="notice" />);
    fireEvent.click(screen.getByRole("button", { name: "Entendido" }));
    expect(sessionStorage.getItem(PORTAL_NOTICE_KEY)).toBe("accepted");
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull();
    expect(container.innerHTML).toBe("");
  });

  it("enlaza la política de cookies de armio.co en pestaña nueva", () => {
    render(<CookieConsentBanner variant="notice" />);
    const link = screen.getByRole("link", { name: "Política de cookies" });
    expect(link.getAttribute("href")).toBe("https://armio.co/cookies");
    expect(link.getAttribute("rel")).toContain("noopener");
  });
});
