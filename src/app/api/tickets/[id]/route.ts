import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieUserId = req.cookies.get("sqrp_user_id")?.value;
    const userId = req.headers.get("x-user-id") || searchParams.get("userId") || cookieUserId;
    const user = getSessionUser(userId);

    const token = searchParams.get("token") || req.headers.get("x-tracking-token");

    const ticket = db.getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: `Ticket record could not be found with identifier: ${params.id}`, code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Role-based evaluation
    if (user) {
      if (user.role === "STUDENT") {
        if (ticket.student_id === user.id) {
          // Owner has full access to their own ticket
          const sanitized = db.sanitizeTicketForViewer(ticket, user.id, user.role);
          return NextResponse.json({ success: true, ticket: sanitized, accessLevel: "OWNER" });
        }

        // Different student: check tracking token match
        if (token && ticket.tracking_token && token.trim().toLowerCase() === ticket.tracking_token.toLowerCase()) {
          const publicTrack = {
            id: ticket.id,
            ticket_number: ticket.ticket_number,
            tracking_token: ticket.tracking_token,
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            department_name: ticket.department_name,
            category_name: ticket.category_name,
            location_building: ticket.location_building,
            location_room: ticket.location_room,
            submitted_at: ticket.submitted_at,
            sla_due_at: ticket.sla_due_at,
            resolved_at: ticket.resolved_at,
            resolution_summary: ticket.resolution_summary,
            history: ticket.history || [],
            is_confidential: true,
            student_name: "[Confidential Student]",
            student_email: "[Protected]",
            worker_updates: db.getWorkerTaskUpdates(ticket.id).map((u) => ({
              id: u.id,
              status: u.status,
              note: u.note,
              created_at: u.created_at,
            })),
          };
          return NextResponse.json({ success: true, ticket: publicTrack, accessLevel: "TRACKER" });
        }

        return NextResponse.json(
          {
            success: false,
            error: "You do not have permission to access another student's query record.",
            code: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      if (user.role === "WORKER") {
        if (ticket.assigned_worker_id !== user.id && ticket.assigned_to !== user.id) {
          return NextResponse.json(
            { success: false, error: "Unauthorized access to task.", code: "FORBIDDEN" },
            { status: 403 }
          );
        }
        const sanitized = db.sanitizeTicketForViewer(ticket, user.id, user.role);
        return NextResponse.json({ success: true, ticket: sanitized, accessLevel: "WORKER" });
      }

      // Faculty / Staff / Admin
      const sanitized = db.sanitizeTicketForViewer(ticket, user.id, user.role);
      return NextResponse.json({ success: true, ticket: sanitized, accessLevel: "STAFF" });
    }

    // Unauthenticated or Public Tracking access:
    // Redact personal details and internal notes strictly
    const publicTrack = {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      tracking_token: ticket.tracking_token,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      department_name: ticket.department_name,
      category_name: ticket.category_name,
      location_building: ticket.location_building,
      location_room: ticket.location_room,
      submitted_at: ticket.submitted_at,
      sla_due_at: ticket.sla_due_at,
      resolved_at: ticket.resolved_at,
      resolution_summary: ticket.resolution_summary,
      history: ticket.history || [],
      is_confidential: true,
      student_name: "[Confidential Student]",
      student_email: "[Protected]",
      worker_updates: db.getWorkerTaskUpdates(ticket.id).map((u) => ({
        id: u.id,
        status: u.status,
        note: u.note,
        created_at: u.created_at,
      })),
    };

    return NextResponse.json({ success: true, ticket: publicTrack, accessLevel: "PUBLIC_TRACKING" });
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
    const cookieUserId = req.cookies.get("sqrp_user_id")?.value;
    const userId = req.headers.get("x-user-id") || body.userId || cookieUserId;
    const user = getSessionUser(userId);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const ticket = db.getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found.", code: "NOT_FOUND" }, { status: 404 });
    }

    // Handle Assignment
    if (body.assignedTo) {
      if (user.role === "STUDENT" || user.role === "WORKER") {
        return NextResponse.json({ success: false, error: "Unauthorized to assign tasks.", code: "FORBIDDEN" }, { status: 403 });
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
