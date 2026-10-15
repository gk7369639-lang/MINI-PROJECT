import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { ApprovalDecisionSchema } from "@/lib/validation/schemas";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId");
    const user = getSessionUser(userId);

    if (user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 403 });
    }

    const deptId = user.role === "ADMIN" ? undefined : user.department_id || undefined;
    const approvals = db.getPendingApprovals(deptId);

    return NextResponse.json({ success: true, approvals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ApprovalDecisionSchema.parse(body);

    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    if (user.role !== "DEPARTMENT_HEAD" && user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Only Department Heads or Admins can make approval decisions." }, { status: 403 });
    }

    const result = db.decideApproval(body.requestId, user.id, validated.decision, validated.comment);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Approval request ${validated.decision.toLowerCase()}.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;
    const user = getSessionUser(userId);

    if (user.role === "STUDENT") {
      return NextResponse.json({ success: false, error: "Students cannot submit approval requests." }, { status: 403 });
    }

    const result = db.createApprovalRequest(
      body.ticketId,
      user.id,
      body.departmentId || user.department_id,
      body.actionType,
      body.reason
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, request: result.request });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
