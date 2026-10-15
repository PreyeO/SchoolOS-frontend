import "@testing-library/jest-dom/vitest";

import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./msw/server";

const hasDom = typeof window !== "undefined";

// "error": a request with no handler fails the test, so a test can never
// pass by accident against a missing mock. (MSW 3 name; v2's
// onUnhandledRequest is silently ignored and falls back to "warn".)
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(async () => {
  server.resetHandlers();
  // Only jsdom files have a DOM and storage to reset (see vitest.config.mts).
  if (hasDom) {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    // Zustand stores are module singletons, so their in-memory state would
    // otherwise carry from one test to the next within a file.
    const { useAuthStore } = await import("@/stores/auth-store");
    const { usePersonaStore } = await import("@/stores/persona-store");
    useAuthStore.setState({ claims: null, tokens: null });
    usePersonaStore.setState({ byMembership: {} });
  }
});

afterAll(() => server.close());
