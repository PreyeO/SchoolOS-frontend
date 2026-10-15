// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDraftBook } from "./draft-book";

const DAY = 24 * 60 * 60 * 1000;

describe("createDraftBook", () => {
  const book = createDraftBook<string>("test-draft");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T08:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("reads back what was written", () => {
    book.write("m1", "arm|maths", { s1: "18", s2: "" });
    expect(book.read("m1", "arm|maths")).toEqual({ s1: "18", s2: "" });
  });

  it("returns null for a sheet with no draft", () => {
    expect(book.read("m1", "nothing-here")).toBeNull();
  });

  it("keeps each membership's drafts apart on a shared device", () => {
    book.write("teacher-a", "k", { s1: "10" });
    expect(book.read("teacher-b", "k")).toBeNull();
  });

  it("keeps sheets apart within one membership", () => {
    book.write("m1", "k1", { s1: "1" });
    book.write("m1", "k2", { s1: "2" });
    expect(book.read("m1", "k1")).toEqual({ s1: "1" });
    expect(book.read("m1", "k2")).toEqual({ s1: "2" });
  });

  it("ignores a draft older than a week", () => {
    book.write("m1", "k", { s1: "10" });
    vi.advanceTimersByTime(7 * DAY + 1);
    expect(book.read("m1", "k")).toBeNull();
  });

  it("keeps a draft just inside the week", () => {
    book.write("m1", "k", { s1: "10" });
    vi.advanceTimersByTime(7 * DAY - 1000);
    expect(book.read("m1", "k")).toEqual({ s1: "10" });
  });

  it("prunes abandoned drafts from storage on the next write", () => {
    book.write("m1", "old", { s1: "1" });
    vi.advanceTimersByTime(8 * DAY);
    book.write("m1", "new", { s1: "2" });
    const stored = JSON.parse(localStorage.getItem("test-draft:m1") ?? "{}");
    expect(Object.keys(stored)).toEqual(["new"]);
  });

  it("clears one sheet and leaves the others", () => {
    book.write("m1", "k1", { s1: "1" });
    book.write("m1", "k2", { s1: "2" });
    book.clear("m1", "k1");
    expect(book.read("m1", "k1")).toBeNull();
    expect(book.read("m1", "k2")).toEqual({ s1: "2" });
  });

  it("clears every membership's drafts on logout, and only its own prefix", () => {
    const other = createDraftBook<string>("other-draft");
    book.write("m1", "k", { s1: "1" });
    book.write("m2", "k", { s1: "2" });
    other.write("m1", "k", { s1: "3" });
    book.clearAll();
    expect(book.read("m1", "k")).toBeNull();
    expect(book.read("m2", "k")).toBeNull();
    expect(other.read("m1", "k")).toEqual({ s1: "3" });
  });

  it("treats corrupt storage as empty instead of throwing", () => {
    localStorage.setItem("test-draft:m1", "{not json");
    expect(book.read("m1", "k")).toBeNull();
    // And recovers on the next write.
    book.write("m1", "k", { s1: "5" });
    expect(book.read("m1", "k")).toEqual({ s1: "5" });
  });

  it("doesn't throw when storage is full", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => book.write("m1", "k", { s1: "1" })).not.toThrow();
    spy.mockRestore();
  });
});
