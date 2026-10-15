import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";
import { FacultyReviewSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId");
    const user = getSessionUser(userId);

    if (
      !user ||
      (user.role !== "FACULTY" &&
        user.role !== "STAFF" &&
        user.role !== "QUERY_SYSTEM_ADMIN" &&
        user.role !== "ADMIN" &&
        user.role !== "DEPARTMENT_HEAD")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized access to faculty review portal." }, { status: 403 });
    }

    // Get all tickets
    let tickets = db.getTickets();

    // Faculty review queue: unassigned, under review, ready for assignment, or department tickets
    if (user.role === "FACULTY" || user.role === "STAFF") {
      tickets = tickets.filter(
        (t) =>
          !t.department_id ||
          t.department_id === user.department_id ||
          t.status === "SUBMITTED" ||
          t.status === "UNDER_FACULTY_REVIEW" ||
          t.status === "READY_FOR_ASSIGNMENT" ||
          t.status === "NOT_RESOLVED" ||
          t.status === "REQUIRES_REASSIGNMENT"
      );
    }

    // Confidentiality: sanitize all tickets so faculty never sees student personal info
    const sanitizedTickets = tickets.map((t) => db.sanitizeTicketForViewer(t, user.id, user.role));
    const workers = db.getWorkers();
    const categories = db.getCategories();
    const departments = db.getDepartments();

    return NextResponse.json({
      success: true,
      tickets: sanitizedTickets,
      workers,
      categories,
      departments,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, ...reviewData } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required." }, { status: 400 });
    }

    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    if (
      !user ||
      (user.role !== "FACULTY" &&
        user.role !== "STAFF" &&
        user.role !== "QUERY_SYSTEM_ADMIN" &&
        user.role !== "ADMIN" &&
        user.role !== "DEPARTMENT_HEAD")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized faculty review rights." }, { status: 403 });
    }

    const validated = FacultyReviewSchema.parse(reviewData);

    if (validated.action === "START_REVIEW") {
      const res = db.startFacultyReview(ticketId, user.id);
      if (!res.success || !res.ticket) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(res.ticket, user.id, user.role),
      });
    }

    if (validated.action === "ASSIGN_WORKER") {
      if (!validated.worker_id) {
        return NextResponse.json({ success: false, error: "worker_id is required for assignment." }, { status: 400 });
      }

      const res = db.assignTicketToWorker({
        ticketId,
        facultyId: user.id,
        workerId: validated.worker_id,
        departmentId: validated.department_id,
        categoryId: validated.category_id,
        priority: validated.priority,
        deadlineHours: validated.deadline_hours,
        facultyNote: validated.faculty_note,
        studentMessage: validated.student_message,
      });

      if (!res.success || !res.ticket) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(res.ticket, user.id, user.role),
      });
    }

    if (validated.action === "REQUEST_CLARIFICATION") {
      const updateRes = db.updateTicketStatus(
        ticketId,
        "WAITING_FOR_CLARIFICATION",
        validated.student_message || "Faculty requested further operational details from reporting student.",
        user.id
      );

      if (!updateRes.success || !updateRes.ticket) {
        return NextResponse.json({ success: false, error: updateRes.error }, { status: 400 });
      }

      if (validated.student_message) {
        db.addTicketMessage(ticketId, user.id, validated.student_message, "SYSTEM_UPDATE");
      }

      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(updateRes.ticket, user.id, user.role),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
