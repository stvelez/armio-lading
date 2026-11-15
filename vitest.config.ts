import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    // React debe resolverse en su build de desarrollo: solo ahí expone `React.act`,
    // que necesitan @testing-library/react 16 + React 19 (react-dom 19 ya eliminó
    // ReactDOMTestUtils.act). Sin esto, Vitest 4 toma la condición `production`.
    env: { NODE_ENV: "development" },
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
