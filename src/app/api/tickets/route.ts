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
    } else if (user.role === "WORKER") {
      // Worker only sees tickets assigned to them
      tickets = tickets.filter((t) => t.assigned_worker_id === user.id || t.assigned_to === user.id);
    } else if (user.role === "FACULTY" || user.role === "STAFF") {
      // Faculty sees unassigned queries, review queue, or department-assigned
      if (user.department_id) {
        tickets = tickets.filter(
          (t) =>
            !t.department_id ||
            t.department_id === user.department_id ||
            t.status === "SUBMITTED" ||
            t.status === "UNDER_FACULTY_REVIEW" ||
            t.status === "READY_FOR_ASSIGNMENT"
        );
      }
    }

    // Apply strict privacy-by-design sanitization for all returned tickets
    const sanitizedTickets = tickets.map((t) => db.sanitizeTicketForViewer(t, user.id, user.role));

    return NextResponse.json({ success: true, tickets: sanitizedTickets });
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

    // Create ticket in database with location and confidential tracking attributes
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
      locationBuilding: validated.location_building,
      locationRoom: validated.location_room,
      imageUrl: validated.image_url,
    });

    // Sanitize ticket for returning to creator
    const sanitizedTicket = db.sanitizeTicketForViewer(ticket, student.id, student.role);

    return NextResponse.json({
      success: true,
      ticket: sanitizedTicket,
      classification,
      routing,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
