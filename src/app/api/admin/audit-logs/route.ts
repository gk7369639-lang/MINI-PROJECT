import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.cookies.get("sqrp_user_id")?.value;
    const user = getSessionUser(userId);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized access to audit logs." }, { status: 403 });
    }

    const logs = db.getAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
