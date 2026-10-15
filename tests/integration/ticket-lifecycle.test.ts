import { describe, it, expect } from "vitest";
import { db } from "@/lib/data/store";

describe("End-to-End Ticket Lifecycle Integration Tests", () => {
  it("executes complete academic support workflow with role isolation", () => {
    // 1. Student creates ticket
    const ticket = db.createTicket({
      studentId: "user-student-1",
      studentName: "Aarav Sharma",
      studentEmail: "student@nite.edu.in",
      studentRegNo: "22BCE1045",
      subject: "Special Examination Clash in Sem 5",
      description: "My Elective CS402 exam clashes with Core CS301 on Dec 12th morning slot.",
      categoryId: "cat-hallticket",
      departmentId: "dept-exam",
      priority: "HIGH",
      assignedTo: "user-staff-2",
    });

    expect(ticket.id).toBeDefined();
    expect(ticket.ticket_number).toContain("SQRP-");
    expect(ticket.status).toBe("ASSIGNED");

    // 2. Staff adds internal note (Confidential)
    const noteRes = db.addInternalNote(
      ticket.id,
      "user-staff-2",
      "Investigating ERP exam hall booking master for conflict."
    );
    expect(noteRes.success).toBe(true);

    // 3. Staff adds public reply
    const replyRes = db.addTicketMessage(
      ticket.id,
      "user-staff-2",
      "Dear Aarav, we have noted the timetable clash. Rescheduling candidate to slot B."
    );
    expect(replyRes.success).toBe(true);

    // 4. Staff transitions ticket to IN_PROGRESS
    const updateRes = db.updateTicketStatus(
      ticket.id,
      "IN_PROGRESS",
      "Faculty reviewing alternative exam slot",
      "user-staff-2"
    );
    expect(updateRes.success).toBe(true);
    expect(ticket.status).toBe("IN_PROGRESS");

    // 5. Staff requests Department Head approval for timetable override
    const approvalRes = db.createApprovalRequest(
      ticket.id,
      "user-staff-2",
      "dept-exam",
      "EXAM_SLOT_RESCHEDULE",
      "Candidate has two core papers scheduled at the exact same hour."
    );
    expect(approvalRes.success).toBe(true);
    expect(ticket.status).toBe("WAITING_FOR_APPROVAL");

    // 6. Department Head approves the request
    const headDecision = db.decideApproval(
      approvalRes.request!.id,
      "user-head-1",
      "APPROVED",
      "Approved rescheduling as per Examination Manual Section 4."
    );
    expect(headDecision.success).toBe(true);
    expect(ticket.status).toBe("IN_PROGRESS");

    // 7. Staff marks ticket RESOLVED
    const resolveRes = db.updateTicketStatus(
      ticket.id,
      "RESOLVED",
      "Hall ticket updated in ERP with slot B. Revised admit card issued.",
      "user-staff-2"
    );
    expect(resolveRes.success).toBe(true);
    expect(ticket.status).toBe("RESOLVED");
    expect(ticket.resolved_at).toBeDefined();

    // 8. Student submits feedback rating
    const feedbackRes = db.submitFeedback(
      ticket.id,
      "user-student-1",
      5,
      "Clash was resolved before the exam. Thank you!"
    );
    expect(feedbackRes.success).toBe(true);
    expect(ticket.has_feedback).toBe(true);
  });
});
