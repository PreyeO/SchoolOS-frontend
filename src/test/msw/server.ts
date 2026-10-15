import { setupServer } from "msw/node";

// One network mock for the whole suite. It starts with no handlers: each test
// declares exactly the responses it relies on with server.use(...).
export const server = setupServer();

// The fake API origin the client talks to in tests (vitest.config.mts). Build
// handler URLs from it plus the real endpoint constant, which already starts
// with /api/ and carries the exact trailing slash:
//   http.patch(apiUrl(TEACHER_ENDPOINTS.DETAIL("t1")), ...)
export const API_ORIGIN = "http://api.test";

export function apiUrl(path: string): string {
  return `${API_ORIGIN}${path}`;
}
