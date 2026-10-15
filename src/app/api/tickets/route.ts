import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { CreateTicketSchema } from "@/lib/validation/schemas";
import { classifierAgent } from "@/lib/ai/classifier";
import { routingAgent } from "@/lib/ai/routing";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId");
    const user = getSessionUser(userId);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const status = searchParams.get("status") as any;
    const search = searchParams.get("search") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;

    let tickets = db.getTickets({
      status,
      search,
      departmentId,
    });

    // Enforce role-based access control
    if (user.role === "STUDENT") {
      tickets = tickets.filter((t) => t.student_id === user.id);
    } else if (user.role === "STAFF") {
      // Staff sees tickets in their department or assigned to them
      if (user.department_id) {
        tickets = tickets.filter((t) => t.department_id === user.department_id || t.assigned_to === user.id);
      }
    } else if (user.role === "DEPARTMENT_HEAD") {
      // Head sees their department's tickets
      if (user.department_id) {
        tickets = tickets.filter((t) => t.department_id === user.department_id);
      }
    }

    // Mask internal notes for students
    if (user.role === "STUDENT") {
      tickets = tickets.map((t) => ({
        ...t,
        internal_notes: [],
      }));
    }

    return NextResponse.json({ success: true, tickets });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateTicketSchema.parse(body);

    const userId = req.headers.get("x-user-id") || body.student_id;
    const student = getSessionUser(userId);

    if (!student) {
      return NextResponse.json({ success: false, error: "Authenticated student profile required to submit a query." }, { status: 401 });
    }

    const categories = db.getCategories();
    const departments = db.getDepartments();

    // Trigger AI Classification Agent
    const classification = await classifierAgent.classifyTicket(
      validated.subject,
      validated.description,
      categories,
      departments
    );

    const categoryId = validated.category_id || classification.suggested_category_id;
    const departmentId = validated.department_id || classification.suggested_department_id;
    const priority = validated.priority || classification.suggested_priority;

    // Trigger Smart Routing Agent
    const routing = routingAgent.routeTicket(departmentId, priority, db.getTickets());

    // Create ticket in database
    const ticket = db.createTicket({
      studentId: student.id,
      studentName: student.full_name,
      studentEmail: student.email,
      studentRegNo: student.student_id_number || undefined,
      subject: validated.subject,
      description: validated.description,
      categoryId,
      departmentId,
      priority,
      assignedTo: routing.recommended_staff_id || undefined,
    });

    return NextResponse.json({
      success: true,
      ticket,
      classification,
      routing,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
