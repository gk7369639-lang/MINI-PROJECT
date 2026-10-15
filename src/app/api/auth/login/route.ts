import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { getDefaultRedirectForRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check database user
    const user = db.getProfileById(cleanEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Account not found." },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: "This account has been deactivated by the administrator." },
        { status: 403 }
      );
    }

    const redirectUrl = getDefaultRedirectForRole(user.role);

    const res = NextResponse.json({
      success: true,
      user,
      redirectUrl,
    });

    // Set secure session cookie
    res.cookies.set("sqrp_user_id", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      httpOnly: false,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
