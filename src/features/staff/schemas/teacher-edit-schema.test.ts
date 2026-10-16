import { describe, expect, it } from "vitest";

import { teacherTypeBlocker, toTeacherPayload, type TeacherEditValues } from "./teacher-edit-schema";

const initial: TeacherEditValues = {
  first_name: "Ada",
  last_name: "Obi",
  phone_number: "+2348012345678",
  employee_id: "T-001",
  qualification: "B.Ed",
  specialization: "Maths",
  teacher_type: "subject",
};

describe("toTeacherPayload", () => {
  it("sends nothing when nothing changed", () => {
    expect(toTeacherPayload({ ...initial }, initial, true)).toEqual({});
  });

  it("sends only the keys that changed", () => {
    const payload = toTeacherPayload({ ...initial, last_name: "Okafor", qualification: "M.Ed" }, initial, true);
    expect(payload).toEqual({ last_name: "Okafor", qualification: "M.Ed" });
  });

  it("never sends a staff-record key in self mode, even when it changed", () => {
    // Any one of these in a teacher's own PATCH 403s the whole request.
    const payload = toTeacherPayload(
      { ...initial, first_name: "Adaeze", employee_id: "HACK", teacher_type: "both" },
      initial,
      false,
    );
    expect(payload).toEqual({ first_name: "Adaeze" });
  });

  it("trims before comparing, so stray spaces are not a change", () => {
    expect(toTeacherPayload({ ...initial, first_name: "  Ada " }, initial, true)).toEqual({});
  });

  it("sends the trimmed value", () => {
    expect(toTeacherPayload({ ...initial, specialization: " Physics  " }, initial, true)).toEqual({
      specialization: "Physics",
    });
  });

  it("clears a field by sending an empty string", () => {
    expect(toTeacherPayload({ ...initial, phone_number: "" }, initial, false)).toEqual({ phone_number: "" });
  });
});

describe("teacherTypeBlocker", () => {
  const busy = { subjectAssignments: 3, classesLed: 2 };
  const idle = { subjectAssignments: 0, classesLed: 0 };

  it("doesn't block when the type isn't changing", () => {
    expect(teacherTypeBlocker("subject", "subject", busy)).toBeNull();
  });

  it("always allows a change to both", () => {
    expect(teacherTypeBlocker("class", "both", busy)).toBeNull();
    expect(teacherTypeBlocker("subject", "both", busy)).toBeNull();
  });

  it("blocks class-only while they still have subject assignments", () => {
    expect(teacherTypeBlocker("both", "class", busy)).toMatch(/3 subject assignments/);
    expect(teacherTypeBlocker("both", "class", { ...idle, subjectAssignments: 1 })).toMatch(/1 subject assignment\./);
  });

  it("blocks subject-only while they still lead a class", () => {
    expect(teacherTypeBlocker("both", "subject", busy)).toMatch(/2 classes/);
    expect(teacherTypeBlocker("both", "subject", { ...idle, classesLed: 1 })).toMatch(/1 class\./);
  });

  it("allows narrowing once nothing is in the way", () => {
    expect(teacherTypeBlocker("both", "class", idle)).toBeNull();
    expect(teacherTypeBlocker("both", "subject", idle)).toBeNull();
  });
});
