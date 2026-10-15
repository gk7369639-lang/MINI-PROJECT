import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = getSessionUser(userId);

    if (!user || (user.role !== "ADMIN" && user.role !== "DEPARTMENT_HEAD")) {
      return NextResponse.json({ success: false, error: "Unauthorized access to reports." }, { status: 403 });
    }

    const tickets = db.getTickets();

    const header = "Ticket Number,Student Identity,Location Building,Location Room,Department,Category,Subject,Priority,Status,Created At,Resolved At,Assigned Worker\n";
    const rows = tickets
      .map((t) => {
        const cleanSubject = `"${(t.subject || "").replace(/"/g, '""')}"`;
        const bldg = `"${(t.location_building || "").replace(/"/g, '""')}"`;
        const room = `"${(t.location_room || "").replace(/"/g, '""')}"`;
        const worker = `"${(t.assigned_worker_name || t.assigned_staff_name || "").replace(/"/g, '""')}"`;
        return `${t.ticket_number},"[Confidential Student]",${bldg},${room},${t.department_code || ""},${t.category_code || ""},${cleanSubject},${t.priority},${t.status},${t.created_at},${t.resolved_at || ""},${worker}`;
      })
      .join("\n");

    const csvContent = header + rows;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sqrp-tickets-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
