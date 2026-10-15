import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { InternalNoteSchema } from "@/lib/validation/schemas";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = InternalNoteSchema.parse(body);

    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    if (!user || user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Students are strictly prohibited from writing internal notes." }, { status: 403 });
    }

    const ticket = db.getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found." }, { status: 404 });
    }

    const result = db.addInternalNote(ticket.id, user.id, validated.content);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, note: result.note });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
