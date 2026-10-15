import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/data/store";
import { Profile } from "@/types";

const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid institutional email format.").toLowerCase(),
  studentIdNumber: z.string().min(3, "Student registration number is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  departmentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const existing = db.getProfileById(validated.email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const newProfile: Profile = {
      id: `user-student-${Date.now()}`,
      email: validated.email,
      full_name: validated.fullName,
      role: "STUDENT",
      student_id_number: validated.studentIdNumber,
      department_id: validated.departmentId || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.addProfile(newProfile);

    const res = NextResponse.json({
      success: true,
      user: newProfile,
      redirectUrl: "/student",
    });

    res.cookies.set("sqrp_user_id", newProfile.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
