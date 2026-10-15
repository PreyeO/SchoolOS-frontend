import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";

import {
  getErrorMessage,
  isNetworkError,
  isPermissionDeniedError,
  isTimeoutError,
  isValidationError,
} from "./get-error-message";

function httpError(status: number, data: unknown): AxiosError {
  const response = { status, data, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } };
  return new AxiosError("Request failed", undefined, undefined, undefined, response as AxiosResponse);
}

function noResponse(code?: string): AxiosError {
  return new AxiosError("timeout", code);
}

describe("getErrorMessage", () => {
  it("shows DRF's detail string as is", () => {
    expect(getErrorMessage(httpError(400, { detail: "Term is locked." }))).toBe("Term is locked.");
  });

  it("joins a detail list", () => {
    expect(getErrorMessage(httpError(400, { detail: ["One.", "Two."] }))).toBe("One. Two.");
  });

  it("shows field-keyed serializer errors without the wire field names", () => {
    const error = httpError(400, {
      audience_personas: ["Duplicate personas in submitted list."],
      non_field_errors: ["Dates overlap."],
    });
    expect(getErrorMessage(error)).toBe("Duplicate personas in submitted list. Dates overlap.");
  });

  it("says the network failed when there was no response", () => {
    expect(getErrorMessage(noResponse())).toBe("Network error. Please check your connection.");
  });

  it("falls back to a generic message for an empty error body", () => {
    expect(getErrorMessage(httpError(500, {}))).toBe("Request failed");
    expect(getErrorMessage("weird")).toBe("Something went wrong. Please try again.");
  });

  it("uses a plain Error's message", () => {
    expect(getErrorMessage(new Error("Boom"))).toBe("Boom");
  });
});

describe("error classifiers", () => {
  it("tell a 403 from a 400", () => {
    expect(isPermissionDeniedError(httpError(403, {}))).toBe(true);
    expect(isPermissionDeniedError(httpError(400, {}))).toBe(false);
    expect(isValidationError(httpError(400, {}))).toBe(true);
  });

  it("separate our own timeout from an unreachable server", () => {
    expect(isTimeoutError(noResponse("ECONNABORTED"))).toBe(true);
    expect(isTimeoutError(noResponse())).toBe(false);
    expect(isNetworkError(noResponse())).toBe(true);
    // A server that answered is never a network error, whatever it said.
    expect(isNetworkError(httpError(500, {}))).toBe(false);
  });

  it("ignore things that aren't axios errors", () => {
    expect(isPermissionDeniedError(new Error("403"))).toBe(false);
    expect(isNetworkError(new Error("offline"))).toBe(false);
  });
});
