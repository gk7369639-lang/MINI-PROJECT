import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { FeedbackSchema } from "@/lib/validation/schemas";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = FeedbackSchema.parse(body);

    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    const result = db.submitFeedback(params.id, user.id, validated.rating, validated.comment);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Thank you for your feedback!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
