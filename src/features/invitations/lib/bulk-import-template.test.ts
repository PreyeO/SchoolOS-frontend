import { describe, expect, it } from "vitest";

import { BULK_IMPORT_HEADER } from "./bulk-import-template";

describe("BULK_IMPORT_HEADER", () => {
  // The backend rejects the whole file unless the header is exactly
  // accounts/services.py's BULK_STUDENT_IMPORT_COLUMNS (as a set). Since
  // backend 95699ce that set has no admission_number: numbers are allocated.
  it("matches the backend's column set, with no admission_number", () => {
    expect(new Set(BULK_IMPORT_HEADER)).toEqual(
      new Set(["first_name", "last_name", "gender", "date_of_birth", "class_name", "arm_name", "email"]),
    );
    expect(BULK_IMPORT_HEADER).toHaveLength(7);
  });
});
