import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId");
    const user = getSessionUser(userId);

    const notifications = db.getNotifications(user.id);
    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    if (body.markAll) {
      db.markAllNotificationsAsRead(user.id);
    } else if (body.notificationId) {
      db.markNotificationAsRead(body.notificationId);
    }

    return NextResponse.json({ success: true, message: "Notifications updated." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
