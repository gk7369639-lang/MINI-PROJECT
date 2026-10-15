import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.cookies.get("sqrp_user_id")?.value;
    const user = getSessionUser(userId);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized access to user directory." }, { status: 403 });
    }

    const profiles = db.getProfiles();
    return NextResponse.json({ success: true, users: profiles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.cookies.get("sqrp_user_id")?.value;
    const user = getSessionUser(userId);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 403 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: "targetUserId is required." }, { status: 400 });
    }

    const newStatus = db.toggleUserStatus(targetUserId);
    return NextResponse.json({ success: true, isActive: newStatus });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
