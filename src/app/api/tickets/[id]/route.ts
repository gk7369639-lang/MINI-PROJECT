import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = getSessionUser(userId);

    const ticket = db.getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    // Role check: student can only view own ticket
    if (user.role === "STUDENT" && ticket.student_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized access to ticket." }, { status: 403 });
    }

    // Role check: worker can only view tickets assigned to them
    if (user.role === "WORKER" && ticket.assigned_worker_id !== user.id && ticket.assigned_to !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized access to task." }, { status: 403 });
    }

    // Never expose student identity to faculty, workers, or admins; mask internal notes for students
    const sanitizedTicket = db.sanitizeTicketForViewer(ticket, user.id, user.role);

    return NextResponse.json({ success: true, ticket: sanitizedTicket });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const ticket = db.getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    // Handle Assignment
    if (body.assignedTo) {
      if (user.role === "STUDENT" || user.role === "WORKER") {
        return NextResponse.json({ success: false, error: "Unauthorized to assign tasks." }, { status: 403 });
      }
      const assignResult = db.assignTicket(ticket.id, body.assignedTo, user.id, "MANUAL", body.reason);
      if (!assignResult.success || !assignResult.ticket) {
        return NextResponse.json({ success: false, error: assignResult.error }, { status: 400 });
      }
      const sanitized = db.sanitizeTicketForViewer(assignResult.ticket, user.id, user.role);
      return NextResponse.json({ success: true, ticket: sanitized });
    }

    // Handle Status Transition
    if (body.status) {
      const updateResult = db.updateTicketStatus(ticket.id, body.status, body.reason || "Status updated", user.id);
      if (!updateResult.success || !updateResult.ticket) {
        return NextResponse.json({ success: false, error: updateResult.error }, { status: 400 });
      }
      const sanitized = db.sanitizeTicketForViewer(updateResult.ticket, user.id, user.role);
      return NextResponse.json({ success: true, ticket: sanitized });
    }

    return NextResponse.json({ success: false, error: "No valid action provided." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
