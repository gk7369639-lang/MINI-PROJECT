import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { TicketMessageSchema } from "@/lib/validation/schemas";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = TicketMessageSchema.parse(body);

    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    const ticket = db.getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    if (user.role === "STUDENT" && ticket.student_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized access to ticket." }, { status: 403 });
    }

    const result = db.addTicketMessage(ticket.id, user.id, validated.content);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
