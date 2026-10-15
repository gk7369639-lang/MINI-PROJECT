import { describe, it, expect } from "vitest";
import { CreateTicketSchema, TicketMessageSchema, ApprovalDecisionSchema, StatusUpdateSchema } from "@/lib/validation/schemas";

describe("Validation Schemas Unit Tests", () => {
  it("should validate a valid ticket creation payload", () => {
    const valid = {
      subject: "Medical OD Attendance Condonation for CS301",
      description: "I was hospitalized for 7 days due to acute viral infection. Attached medical certificates.",
      priority: "HIGH",
    };
    const result = CreateTicketSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject ticket creation when subject is too short", () => {
    const invalid = {
      subject: "Help",
      description: "This is long enough description but subject is too short.",
    };
    const result = CreateTicketSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("Subject must be at least 5 characters");
    }
  });

  it("should reject ticket creation when description is under 20 chars", () => {
    const invalid = {
      subject: "Valid Subject Here",
      description: "Too short",
    };
    const result = CreateTicketSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("at least 20 characters");
    }
  });

  it("should validate approval decisions", () => {
    const approved = {
      decision: "APPROVED",
      comment: "Approved as per Regulation 8.2 after verifying inpatient certificate.",
    };
    expect(ApprovalDecisionSchema.safeParse(approved).success).toBe(true);

    const rejected = {
      decision: "REJECTED",
      comment: "Bad",
    };
    expect(ApprovalDecisionSchema.safeParse(rejected).success).toBe(false);
  });

  it("should validate valid status transition reasons", () => {
    const statusUpdate = {
      status: "IN_PROGRESS",
      reason: "Staff assigned and verifying university records",
    };
    expect(StatusUpdateSchema.safeParse(statusUpdate).success).toBe(true);
  });
});
