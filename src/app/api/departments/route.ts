import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const departments = db.getDepartments();
    const categories = db.getCategories();
    return NextResponse.json({ success: true, departments, categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.cookies.get("sqrp_user_id")?.value;
    const user = getSessionUser(userId);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const { categoryId } = await req.json();
    if (!categoryId) {
      return NextResponse.json({ success: false, error: "categoryId is required." }, { status: 400 });
    }

    const newApprovalState = db.toggleCategoryApproval(categoryId);
    return NextResponse.json({ success: true, requiresApproval: newApprovalState });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
