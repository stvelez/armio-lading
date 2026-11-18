import { afterEach, describe, expect, it, vi } from "vitest";
import { SERVER_NETWORK_TIMEOUT_MS, serverNetworkAgentOptions } from "@/lib/server-network";
import { setupServerNetworkTimeouts } from "@/lib/server-network-node";

const mocks = vi.hoisted(() => ({
  agentOptions: [] as unknown[],
  setGlobalDispatcher: vi.fn(),
}));

vi.mock("undici", () => ({
  Agent: class {
    constructor(options: unknown) {
      mocks.agentOptions.push(options);
    }
  },
  setGlobalDispatcher: mocks.setGlobalDispatcher,
}));

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/server-network-node");
  vi.doUnmock("@sentry/nextjs");
});

describe("límite de red global del servidor", () => {
  it("acota connect, headers y body a 10 s", () => {
    expect(SERVER_NETWORK_TIMEOUT_MS).toBe(10_000);
    expect(serverNetworkAgentOptions()).toEqual({
      connect: { timeout: 10_000 },
      headersTimeout: 10_000,
      bodyTimeout: 10_000,
    });
  });

  it("instala el Agent global una sola vez", () => {
    setupServerNetworkTimeouts();
    setupServerNetworkTimeouts();
    expect(mocks.setGlobalDispatcher).toHaveBeenCalledTimes(1);
    expect(mocks.agentOptions).toEqual([serverNetworkAgentOptions()]);
  });

  it("instrumentation solo lo configura en runtime nodejs", async () => {
    vi.resetModules();
    const setup = vi.fn();
    vi.doMock("@/lib/server-network-node", () => ({ setupServerNetworkTimeouts: setup }));
    vi.doMock("@sentry/nextjs", () => ({ init: vi.fn(), captureRequestError: vi.fn() }));
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("SENTRY_DSN", "");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");

    const mod = await import("@/instrumentation");
    await mod.register();
    expect(setup).toHaveBeenCalledTimes(1);
  });
});
