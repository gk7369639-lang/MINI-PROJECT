import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";
import { WorkerActionSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId");
    const user = getSessionUser(userId);

    if (!user || user.role !== "WORKER") {
      return NextResponse.json({ success: false, error: "Unauthorized access to worker tasks." }, { status: 403 });
    }

    const statusFilter = searchParams.get("status") || "ALL";
    const tasks = db.getWorkerTasks(user.id, statusFilter);
    const updates = db.getWorkerTaskUpdates();

    return NextResponse.json({
      success: true,
      tasks,
      updates,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, ...actionData } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required." }, { status: 400 });
    }

    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    if (!user || user.role !== "WORKER") {
      return NextResponse.json({ success: false, error: "Unauthorized. Worker credentials required." }, { status: 403 });
    }

    const validated = WorkerActionSchema.parse(actionData);

    if (validated.action === "ACCEPT") {
      const res = db.workerAcceptTask(ticketId, user.id);
      if (!res.success || !res.ticket) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(res.ticket, user.id, user.role),
      });
    }

    if (validated.action === "START") {
      const res = db.workerStartWork(ticketId, user.id, validated.note);
      if (!res.success || !res.ticket) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(res.ticket, user.id, user.role),
      });
    }

    if (validated.action === "UPDATE_PROGRESS") {
      const note = validated.note || (validated.parts_required ? `Requested parts: ${validated.parts_required}` : "Progress updated");
      const res = db.workerUpdateProgress(ticketId, user.id, note, validated.parts_required);
      if (!res.success || !res.ticket) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(res.ticket, user.id, user.role),
      });
    }

    if (validated.action === "RESOLVE") {
      if (!validated.resolution_summary) {
        return NextResponse.json({ success: false, error: "Resolution summary is required." }, { status: 400 });
      }
      const res = db.workerResolveTask(ticketId, user.id, validated.resolution_summary);
      if (!res.success || !res.ticket) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(res.ticket, user.id, user.role),
      });
    }

    if (validated.action === "NOT_RESOLVED") {
      if (!validated.reason) {
        return NextResponse.json({ success: false, error: "Unresolved reason is required." }, { status: 400 });
      }
      const res = db.workerReportNotResolved(ticketId, user.id, validated.reason);
      if (!res.success || !res.ticket) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        ticket: db.sanitizeTicketForViewer(res.ticket, user.id, user.role),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid worker action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
