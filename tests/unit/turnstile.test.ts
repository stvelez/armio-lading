// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TURNSTILE_LOAD_TIMEOUT_MS,
  TURNSTILE_SCRIPT_URL,
  loadTurnstile,
  turnstileSiteKey,
  type TurnstileApi,
} from "@/portal/lib/turnstile";

const scripts = () => Array.from(document.head.querySelectorAll("script"));

const fakeApi = (): TurnstileApi => ({ render: vi.fn(), reset: vi.fn(), remove: vi.fn() });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(async () => {
  // Cierra cualquier carga pendiente para no contaminar la siguiente prueba
  if (window.__armioTurnstileOnload) {
    window.turnstile = fakeApi();
    window.__armioTurnstileOnload();
  }
  await vi.runAllTimersAsync();
  delete window.turnstile;
  delete window.__armioTurnstileOnload;
  document.head.innerHTML = "";
  vi.useRealTimers();
});

describe("turnstileSiteKey", () => {
  it("vacío o con espacios -> undefined", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    expect(turnstileSiteKey()).toBeUndefined();
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "   ");
    expect(turnstileSiteKey()).toBeUndefined();
  });

  it("sin variable -> undefined", () => {
    expect(turnstileSiteKey()).toBeUndefined();
  });

  it("con valor -> recortado", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "  1x00000000000000000000AA ");
    expect(turnstileSiteKey()).toBe("1x00000000000000000000AA");
  });
});

describe("loadTurnstile", () => {
  it("inyecta un solo script con la URL exacta aunque se llame 3 veces, y resuelve con onload", async () => {
    const a = loadTurnstile();
    const b = loadTurnstile();
    const c = loadTurnstile();
    expect(scripts()).toHaveLength(1);
    expect(scripts()[0].src).toBe(TURNSTILE_SCRIPT_URL);
    expect(TURNSTILE_SCRIPT_URL).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__armioTurnstileOnload"
    );
    expect(scripts()[0].async).toBe(true);

    const api = fakeApi();
    window.turnstile = api;
    window.__armioTurnstileOnload?.();
    await expect(Promise.all([a, b, c])).resolves.toEqual([api, api, api]);
  });

  it("si window.turnstile ya existe no inyecta nada", async () => {
    const api = fakeApi();
    window.turnstile = api;
    await expect(loadTurnstile()).resolves.toBe(api);
    expect(scripts()).toHaveLength(0);
  });

  it("rechaza por onerror y permite reintentar", async () => {
    const first = loadTurnstile();
    const failure = expect(first).rejects.toThrow();
    scripts()[0].onerror?.(new Event("error"));
    await failure;
    expect(scripts()).toHaveLength(0);

    const second = loadTurnstile();
    expect(scripts()).toHaveLength(1);
    const api = fakeApi();
    window.turnstile = api;
    window.__armioTurnstileOnload?.();
    await expect(second).resolves.toBe(api);
  });

  it("rechaza por timeout y permite reintentar", async () => {
    const first = loadTurnstile();
    const failure = expect(first).rejects.toThrow(/timeout/);
    await vi.advanceTimersByTimeAsync(TURNSTILE_LOAD_TIMEOUT_MS + 1);
    await failure;

    void loadTurnstile();
    expect(scripts()).toHaveLength(1);
  });
});
