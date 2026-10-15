import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const cookieUserId = req.cookies.get("sqrp_user_id")?.value;
    const headerUserId = req.headers.get("x-user-id");
    const userId = cookieUserId || headerUserId;

    if (!userId) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = db.getProfileById(userId);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
