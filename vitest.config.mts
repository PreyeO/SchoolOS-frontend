import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Unit tests. See "Testing" in docs/PROJECT.md for the conventions.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    // Node by default: most tests are pure logic, and starting jsdom for each
    // file was two thirds of the run time. A test that renders or touches
    // window/localStorage opts in with a first-line comment:
    //   // @vitest-environment jsdom
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    // 15s, not the 5s default: form tests type whole serials and PINs a key
    // at a time with user-event, and under a full parallel run on a laptop one
    // crossed 5s and failed with nothing actually wrong.
    testTimeout: 15_000,
    // A fake origin: any request without an MSW handler fails loudly instead
    // of reaching a real backend.
    env: { NEXT_PUBLIC_API_BASE_URL: "http://api.test" },
    // jsdom's XMLHttpRequest enforces CORS, so a page on its default
    // localhost origin can't read a mocked api.test response ("Network
    // Error"). Same origin sidesteps it; CORS is the real backend's concern.
    environmentOptions: { jsdom: { url: "http://api.test/" } },
  },
});
