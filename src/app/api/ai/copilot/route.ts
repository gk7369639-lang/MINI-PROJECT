import { NextRequest, NextResponse } from "next/server";
import { copilotService } from "@/lib/ai/copilot";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    const { action } = body;

    if (action === "assist-student") {
      const { subject, description } = body;
      const kbs = db.getKnowledgeBase();
      const suggestion = await copilotService.assistStudentQuery(subject || "", description || "", kbs);
      return NextResponse.json({ success: true, suggestion });
    }

    if (action === "staff-copilot") {
      if (!user || user.role === "STUDENT") {
        return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 403 });
      }
      const ticket = db.getTicketById(body.ticketId);
      if (!ticket) {
        return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
      }
      const copilotDraft = await copilotService.generateStaffCopilot(ticket, user.full_name);
      return NextResponse.json({ success: true, copilotDraft });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
