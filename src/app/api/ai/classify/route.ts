import { NextRequest, NextResponse } from "next/server";
import { classifierAgent } from "@/lib/ai/classifier";
import { db } from "@/lib/data/store";

export async function POST(req: NextRequest) {
  try {
    const { subject, description } = await req.json();

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: "Subject and description are required for classification." },
        { status: 400 }
      );
    }

    const categories = db.getCategories();
    const departments = db.getDepartments();

    const classification = await classifierAgent.classifyTicket(
      subject,
      description,
      categories,
      departments
    );

    return NextResponse.json({ success: true, classification });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
