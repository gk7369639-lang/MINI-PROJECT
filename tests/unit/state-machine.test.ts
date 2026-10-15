import { describe, it, expect } from "vitest";
import { validateStateTransition } from "@/lib/state-machine";

describe("State Machine Transition & Role Permission Unit Tests", () => {
  it("allows Staff to transition SUBMITTED ticket to IN_PROGRESS via ASSIGNED", () => {
    const res1 = validateStateTransition("SUBMITTED", "ASSIGNED", "STAFF");
    expect(res1.allowed).toBe(true);

    const res2 = validateStateTransition("ASSIGNED", "IN_PROGRESS", "STAFF");
    expect(res2.allowed).toBe(true);
  });

  it("prevents Student from unilaterally resolving or approving their own ticket", () => {
    const res = validateStateTransition("IN_PROGRESS", "RESOLVED", "STUDENT", true);
    expect(res.allowed).toBe(false);
    expect(res.error).toContain("Students are not authorized");
  });

  it("allows Student to confirm resolution of a RESOLVED ticket into CLOSED", () => {
    const res = validateStateTransition("RESOLVED", "CLOSED", "STUDENT", true);
    expect(res.allowed).toBe(true);
  });

  it("allows Student to reopen a RESOLVED ticket with required reason", () => {
    const res = validateStateTransition("RESOLVED", "REOPENED", "STUDENT", true);
    expect(res.allowed).toBe(true);
    expect(res.requiresReason).toBe(true);
  });

  it("prevents arbitrary invalid state transitions like SUBMITTED directly to CLOSED", () => {
    const res = validateStateTransition("SUBMITTED", "CLOSED", "STAFF");
    expect(res.allowed).toBe(false);
    expect(res.error).toContain("Invalid transition");
  });

  it("requires Department Head authorization when ticket is in WAITING_FOR_APPROVAL", () => {
    const staffRes = validateStateTransition("WAITING_FOR_APPROVAL", "RESOLVED", "STAFF");
    expect(staffRes.allowed).toBe(false);

    const headRes = validateStateTransition("WAITING_FOR_APPROVAL", "RESOLVED", "DEPARTMENT_HEAD");
    expect(headRes.allowed).toBe(true);
  });
});
