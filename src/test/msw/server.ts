import { setupServer } from "msw/node";

// One network mock for the whole suite. It starts with no handlers: each test
// declares exactly the responses it relies on with server.use(...), using
// paths from lib/api/endpoints so trailing slashes match the real API.
export const server = setupServer();

// Endpoint paths are relative; this is the base the client prefixes them with
// in tests (see vitest.config.mts).
export const API = "http://api.test/api";
