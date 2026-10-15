import {
  Department,
  SupportCategory,
  Profile,
  Ticket,
  TicketMessage,
  InternalNote,
  TicketStatusHistoryItem,
  ApprovalRequest,
  NotificationItem,
  KnowledgeBaseArticle,
  FeedbackRecord,
  AuditLogItem,
  TicketStatus,
  TicketPriority,
  UserRole,
  ApprovalStatus,
} from "@/types";
import { generateTicketNumber } from "@/lib/utils";
import { validateStateTransition } from "@/lib/state-machine";

// In-Memory Database Store with Real State Management
class DataRepository {
  private departments: Department[] = [
    {
      id: "dept-acad",
      code: "ACAD",
      name: "Academic Affairs & Registry",
      description: "Course registrations, credit transfers, transcripts, and degree certificates",
      contact_email: "academics@nite.edu.in",
      head_profile_id: "user-head-1",
      head_name: "Prof. Meenakshi Sundaram",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "dept-exam",
      code: "EXAM",
      name: "Examination Cell & Evaluation",
      description: "End-semester exams, hall tickets, revaluation, and grade cards",
      contact_email: "examcell@nite.edu.in",
      head_profile_id: "user-head-2",
      head_name: "Dr. K. S. Narayanan",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "dept-fin",
      code: "FIN",
      name: "Accounts & Finance",
      description: "Tuition fees, hostel dues, scholarship stipends, and refund requests",
      contact_email: "finance@nite.edu.in",
      head_profile_id: null,
      head_name: "Finance Controller",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "dept-cse",
      code: "CSE",
      name: "Computer Science & Engineering",
      description: "Departmental labs, elective approvals, capstone projects",
      contact_email: "cse.dept@nite.edu.in",
      head_profile_id: null,
      head_name: "Dr. S. Radhakrishnan",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "dept-hostel",
      code: "HOSTEL",
      name: "Hostel & Residential Services",
      description: "Room allotment, mess queries, hostel maintenance, transport",
      contact_email: "hostel@nite.edu.in",
      head_profile_id: null,
      head_name: "Chief Warden",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "dept-its",
      code: "ITS",
      name: "Campus IT & Infrastructure Support",
      description: "Campus WiFi, student portal credentials, email access, lab network",
      contact_email: "itsupport@nite.edu.in",
      head_profile_id: null,
      head_name: "IT Director",
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  private categories: SupportCategory[] = [
    {
      id: "cat-att",
      department_id: "dept-acad",
      department_name: "Academic Affairs & Registry",
      name: "Attendance Shortage & On-Duty (OD) Exemption",
      code: "ATTENDANCE_EXEMPTION",
      description: "Medical or institutional OD requests requiring Academic Head approval",
      sla_hours: 48,
      requires_approval: true,
      is_active: true,
    },
    {
      id: "cat-bonafide",
      department_id: "dept-acad",
      department_name: "Academic Affairs & Registry",
      name: "Bonafide & Official Transcripts",
      code: "CERTIFICATE_BONAFIDE",
      description: "Application for bonafide letters and authenticated grade transcripts",
      sla_hours: 24,
      requires_approval: false,
      is_active: true,
    },
    {
      id: "cat-hallticket",
      department_id: "dept-exam",
      department_name: "Examination Cell & Evaluation",
      name: "Hall Ticket Discrepancy",
      code: "HALL_TICKET_ERROR",
      description: "Course code or name corrections on exam admit cards",
      sla_hours: 24,
      requires_approval: false,
      is_active: true,
    },
    {
      id: "cat-reval",
      department_id: "dept-exam",
      department_name: "Examination Cell & Evaluation",
      name: "Revaluation & Paper Viewing",
      code: "EXAM_REVALUATION",
      description: "Answer booklet re-checking and grade moderation",
      sla_hours: 72,
      requires_approval: true,
      is_active: true,
    },
    {
      id: "cat-fee-receipt",
      department_id: "dept-fin",
      department_name: "Accounts & Finance",
      name: "Tuition Fee Payment & Receipt Reconcile",
      code: "FEE_RECEIPT_ISSUE",
      description: "Gateway debited amount not reflected in student portal",
      sla_hours: 48,
      requires_approval: false,
      is_active: true,
    },
    {
      id: "cat-fee-installment",
      department_id: "dept-fin",
      department_name: "Accounts & Finance",
      name: "Fee Concession & Installment Permission",
      code: "FEE_CONCESSION",
      description: "Special request for split fee payment due to economic hardship",
      sla_hours: 72,
      requires_approval: true,
      is_active: true,
    },
    {
      id: "cat-wifi",
      department_id: "dept-its",
      department_name: "Campus IT & Infrastructure Support",
      name: "Campus WiFi & Portal Credentials",
      code: "IT_PORTAL_ACCESS",
      description: "MAC address binding, LDAP password reset, eduroam setup",
      sla_hours: 12,
      requires_approval: false,
      is_active: true,
    },
    {
      id: "cat-hostel",
      department_id: "dept-hostel",
      department_name: "Hostel & Residential Services",
      name: "Hostel Room Maintenance",
      code: "HOSTEL_MAINTENANCE",
      description: "Electrical, plumbing, carpentry, or HVAC issues in dormitories",
      sla_hours: 24,
      requires_approval: false,
      is_active: true,
    },
  ];

  private profiles: Profile[] = [
    {
      id: "user-student-1",
      email: "student@nite.edu.in",
      full_name: "Aarav Sharma",
      role: "STUDENT",
      department_id: "dept-cse",
      department_name: "Computer Science & Engineering",
      phone: "+91 98765 43210",
      student_id_number: "22BCE1045",
      is_active: true,
      created_at: "2026-01-10T10:00:00Z",
      updated_at: "2026-01-10T10:00:00Z",
    },
    {
      id: "user-staff-1",
      email: "staff@nite.edu.in",
      full_name: "Dr. Ramesh Kumar",
      role: "STAFF",
      department_id: "dept-acad",
      department_name: "Academic Affairs & Registry",
      phone: "+91 98765 43211",
      is_active: true,
      created_at: "2025-08-01T10:00:00Z",
      updated_at: "2025-08-01T10:00:00Z",
    },
    {
      id: "user-staff-2",
      email: "staff.exam@nite.edu.in",
      full_name: "S. Priya",
      role: "STAFF",
      department_id: "dept-exam",
      department_name: "Examination Cell & Evaluation",
      phone: "+91 98765 43212",
      is_active: true,
      created_at: "2025-08-01T10:00:00Z",
      updated_at: "2025-08-01T10:00:00Z",
    },
    {
      id: "user-head-1",
      email: "head@nite.edu.in",
      full_name: "Prof. Meenakshi Sundaram",
      role: "DEPARTMENT_HEAD",
      department_id: "dept-acad",
      department_name: "Academic Affairs & Registry",
      phone: "+91 98765 43213",
      is_active: true,
      created_at: "2025-06-01T10:00:00Z",
      updated_at: "2025-06-01T10:00:00Z",
    },
    {
      id: "user-admin-1",
      email: "admin@nite.edu.in",
      full_name: "System Administrator",
      role: "ADMIN",
      is_active: true,
      created_at: "2025-01-01T10:00:00Z",
      updated_at: "2025-01-01T10:00:00Z",
    },
  ];

  private tickets: Ticket[] = [];

  private knowledgeBase: KnowledgeBaseArticle[] = [
    {
      id: "kb-1",
      title: "How to Apply for Medical Leave / OD Attendance Waiver",
      slug: "how-to-apply-medical-od-waiver",
      content: "Students who missed lectures due to authorized medical leave or official college sports/cultural representations must upload hospital discharge summaries or faculty coordinator authorization letters within 5 days of returning. Approvals are vetted by the Academic Head.",
      category_id: "cat-att",
      category_name: "Attendance Shortage & On-Duty (OD) Exemption",
      department_id: "dept-acad",
      department_name: "Academic Affairs & Registry",
      tags: ["attendance", "medical", "od", "leave"],
      is_published: true,
      view_count: 142,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "kb-2",
      title: "Fixing Double Deductions During Online Fee Payments",
      slug: "fixing-double-deductions-fee-payment",
      content: "If money was debited from your bank account but your student portal still shows 'Pending Payment', please note that banking gateways require up to 24 hours to reconcile. If the receipt does not auto-generate within 24 hours, submit a query under Accounts with your Transaction Reference Number (UTR).",
      category_id: "cat-fee-receipt",
      category_name: "Tuition Fee Payment & Receipt Reconcile",
      department_id: "dept-fin",
      department_name: "Accounts & Finance",
      tags: ["fees", "payment", "refund", "receipt"],
      is_published: true,
      view_count: 289,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "kb-3",
      title: "Connecting Laptops and Mobile Devices to Campus 5GHz WiFi",
      slug: "connecting-to-campus-wifi",
      content: "To register your device MAC address for the campus high-speed WiFi network, use your Institute Roll Number and LDAP credentials. Personal routers or hotspot repeaters are strictly prohibited inside university dorms.",
      category_id: "cat-wifi",
      category_name: "Campus WiFi & Portal Credentials",
      department_id: "dept-its",
      department_name: "Campus IT & Infrastructure Support",
      tags: ["wifi", "it-support", "internet", "network"],
      is_published: true,
      view_count: 514,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ];

  private notifications: NotificationItem[] = [];
  private feedbackList: FeedbackRecord[] = [];
  private auditLogs: AuditLogItem[] = [];

  public addProfile(profile: Profile): void {
    this.profiles.push(profile);
  }

  public toggleUserStatus(userId: string): boolean {
    const user = this.profiles.find((p) => p.id === userId);
    if (user) {
      user.is_active = !user.is_active;
      return user.is_active;
    }
    return false;
  }

  public toggleCategoryApproval(categoryId: string): boolean {
    const cat = this.categories.find((c) => c.id === categoryId);
    if (cat) {
      cat.requires_approval = !cat.requires_approval;
      return cat.requires_approval;
    }
    return false;
  }

  // Repository Methods
  public getDepartments(): Department[] {
    return [...this.departments];
  }

  public getDepartmentById(id: string): Department | undefined {
    return this.departments.find((d) => d.id === id || d.code === id);
  }

  public getCategories(): SupportCategory[] {
    return [...this.categories];
  }

  public getCategoryById(id: string): SupportCategory | undefined {
    return this.categories.find((c) => c.id === id || c.code === id);
  }

  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id || p.email === id);
  }

  public getTickets(filters?: {
    studentId?: string;
    departmentId?: string;
    assignedTo?: string;
    status?: TicketStatus;
    search?: string;
  }): Ticket[] {
    return this.tickets.filter((t) => {
      if (filters?.studentId && t.student_id !== filters.studentId) return false;
      if (filters?.departmentId && t.department_id !== filters.departmentId) return false;
      if (filters?.assignedTo && t.assigned_to !== filters.assignedTo) return false;
      if (filters?.status && t.status !== filters.status) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchesSubject = t.subject.toLowerCase().includes(q);
        const matchesNumber = t.ticket_number.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        if (!matchesSubject && !matchesNumber && !matchesDesc) return false;
      }
      return true;
    });
  }

  public getTicketById(id: string): Ticket | undefined {
    return this.tickets.find((t) => t.id === id || t.ticket_number === id);
  }

  public createTicket(data: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentRegNo?: string;
    subject: string;
    description: string;
    categoryId?: string;
    departmentId?: string;
    priority?: TicketPriority;
    assignedTo?: string;
  }): Ticket {
    const category = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;
    const department = data.departmentId
      ? this.getDepartmentById(data.departmentId)
      : category
      ? this.getDepartmentById(category.department_id)
      : undefined;

    const ticketNumber = generateTicketNumber();
    const id = `ticket-${Date.now()}`;
    const now = new Date().toISOString();
    const slaHours = category?.sla_hours || 48;
    const slaDueAt = new Date(Date.now() + slaHours * 3600000).toISOString();

    const assignedStaff = data.assignedTo ? this.getProfileById(data.assignedTo) : undefined;

    const newTicket: Ticket = {
      id,
      ticket_number: ticketNumber,
      student_id: data.studentId,
      student_name: data.studentName,
      student_email: data.studentEmail,
      student_reg_no: data.studentRegNo,
      department_id: department?.id || null,
      department_name: department?.name || null,
      department_code: department?.code || null,
      category_id: category?.id || null,
      category_name: category?.name || null,
      category_code: category?.code || null,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "MEDIUM",
      status: assignedStaff ? "ASSIGNED" : "SUBMITTED",
      sla_due_at: slaDueAt,
      assigned_to: assignedStaff?.id || null,
      assigned_staff_name: assignedStaff?.full_name || null,
      created_at: now,
      updated_at: now,
      messages: [],
      internal_notes: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          ticket_id: id,
          changed_by: data.studentId,
          changer_name: data.studentName,
          changer_role: "STUDENT",
          old_status: null,
          new_status: assignedStaff ? "ASSIGNED" : "SUBMITTED",
          reason: assignedStaff ? "Assigned upon creation" : "Initial submission",
          created_at: now,
        },
      ],
      approval_requests: [],
    };

    this.tickets.unshift(newTicket);

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_id: data.studentId,
      actor_name: data.studentName,
      actor_role: "STUDENT",
      action: "TICKET_CREATED",
      entity_type: "TICKET",
      entity_id: id,
      details: { ticket_number: ticketNumber, subject: data.subject },
      created_at: now,
    });

    return newTicket;
  }

  public updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    reason: string,
    changedById: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Ticket not found." };

    const changer = this.getProfileById(changedById);
    if (!changer) return { success: false, error: "Actor profile not found." };

    const isOwner = ticket.student_id === changer.id;
    const validation = validateStateTransition(ticket.status, newStatus, changer.role, isOwner);
    if (!validation.allowed) {
      return { success: false, error: validation.error };
    }

    const oldStatus = ticket.status;
    ticket.status = newStatus;
    ticket.updated_at = new Date().toISOString();

    if (newStatus === "RESOLVED") {
      ticket.resolved_at = new Date().toISOString();
      ticket.resolution_summary = reason;
    } else if (newStatus === "CLOSED") {
      ticket.closed_at = new Date().toISOString();
    } else if (newStatus === "REOPENED") {
      ticket.reopened_reason = reason;
      ticket.resolved_at = null;
    }

    const historyItem: TicketStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: changer.id,
      changer_name: changer.full_name,
      changer_role: changer.role,
      old_status: oldStatus,
      new_status: newStatus,
      reason,
      created_at: new Date().toISOString(),
    };

    if (!ticket.history) ticket.history = [];
    ticket.history.push(historyItem);

    // Notify student if changed by staff/head
    if (changer.id !== ticket.student_id) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: ticket.student_id,
        title: `Ticket ${ticket.ticket_number} Updated`,
        message: `Status updated to ${newStatus}. Reason: ${reason}`,
        link: `/student/tickets/${ticket.id}`,
        is_read: false,
        notification_type: "STATUS_CHANGED",
        created_at: new Date().toISOString(),
      });
    }

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_id: changer.id,
      actor_name: changer.full_name,
      actor_role: changer.role,
      action: `STATUS_CHANGED_TO_${newStatus}`,
      entity_type: "TICKET",
      entity_id: ticket.id,
      details: { oldStatus, newStatus, reason },
      created_at: new Date().toISOString(),
    });

    return { success: true, ticket };
  }

  public assignTicket(
    ticketId: string,
    assignedToId: string,
    assignedById: string,
    assignmentType: "MANUAL" | "AUTO_AI" | "ESCALATED" = "MANUAL",
    reason?: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Ticket not found." };

    const targetStaff = this.getProfileById(assignedToId);
    if (!targetStaff || (targetStaff.role !== "STAFF" && targetStaff.role !== "DEPARTMENT_HEAD")) {
      return { success: false, error: "Invalid staff member for assignment." };
    }

    const assigner = this.getProfileById(assignedById);

    ticket.assigned_to = targetStaff.id;
    ticket.assigned_staff_name = targetStaff.full_name;
    if (ticket.status === "SUBMITTED" || ticket.status === "TRIAGED") {
      ticket.status = "ASSIGNED";
    }
    ticket.updated_at = new Date().toISOString();

    const historyItem: TicketStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: assigner?.id || null,
      changer_name: assigner?.full_name || "System Router",
      changer_role: assigner?.role || null,
      old_status: ticket.status,
      new_status: "ASSIGNED",
      reason: reason || `Assigned to ${targetStaff.full_name} (${assignmentType})`,
      created_at: new Date().toISOString(),
    };

    if (!ticket.history) ticket.history = [];
    ticket.history.push(historyItem);

    // Notify staff
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: targetStaff.id,
      title: `Ticket ${ticket.ticket_number} Assigned to You`,
      message: `${ticket.subject} (Priority: ${ticket.priority})`,
      link: `/staff/tickets/${ticket.id}`,
      is_read: false,
      notification_type: "TICKET_ASSIGNED",
      created_at: new Date().toISOString(),
    });

    return { success: true, ticket };
  }

  public addTicketMessage(
    ticketId: string,
    senderId: string,
    content: string,
    type: "PUBLIC_REPLY" | "SYSTEM_UPDATE" = "PUBLIC_REPLY"
  ): { success: boolean; error?: string; message?: TicketMessage } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Ticket not found." };

    const sender = this.getProfileById(senderId);
    if (!sender) return { success: false, error: "Sender profile not found." };

    const msg: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticket_id: ticket.id,
      sender_id: sender.id,
      sender_name: sender.full_name,
      sender_role: sender.role,
      message_type: type,
      content,
      created_at: new Date().toISOString(),
    };

    if (!ticket.messages) ticket.messages = [];
    ticket.messages.push(msg);
    ticket.updated_at = new Date().toISOString();

    // If waiting for student and student replies, return to IN_PROGRESS
    if (ticket.status === "WAITING_FOR_STUDENT" && sender.role === "STUDENT") {
      ticket.status = "IN_PROGRESS";
      ticket.history?.push({
        id: `hist-${Date.now()}`,
        ticket_id: ticket.id,
        changed_by: sender.id,
        changer_name: sender.full_name,
        changer_role: "STUDENT",
        old_status: "WAITING_FOR_STUDENT",
        new_status: "IN_PROGRESS",
        reason: "Student provided response",
        created_at: new Date().toISOString(),
      });
    }

    // Notifications
    const recipientId = sender.role === "STUDENT" ? ticket.assigned_to : ticket.student_id;
    if (recipientId) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: recipientId,
        title: `New Reply on ${ticket.ticket_number}`,
        message: `${sender.full_name}: ${content.substring(0, 100)}...`,
        link: sender.role === "STUDENT" ? `/staff/tickets/${ticket.id}` : `/student/tickets/${ticket.id}`,
        is_read: false,
        notification_type: "REPLY_RECEIVED",
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, message: msg };
  }

  public addInternalNote(
    ticketId: string,
    authorId: string,
    content: string
  ): { success: boolean; error?: string; note?: InternalNote } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Ticket not found." };

    const author = this.getProfileById(authorId);
    if (!author || author.role === "STUDENT") {
      return { success: false, error: "Only staff and administrators can create internal notes." };
    }

    const note: InternalNote = {
      id: `note-${Date.now()}`,
      ticket_id: ticket.id,
      author_id: author.id,
      author_name: author.full_name,
      author_role: author.role,
      content,
      created_at: new Date().toISOString(),
    };

    if (!ticket.internal_notes) ticket.internal_notes = [];
    ticket.internal_notes.push(note);
    ticket.updated_at = new Date().toISOString();

    return { success: true, note };
  }

  public createApprovalRequest(
    ticketId: string,
    requestedById: string,
    departmentId: string,
    actionType: string,
    reason: string
  ): { success: boolean; error?: string; request?: ApprovalRequest } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Ticket not found." };

    const requester = this.getProfileById(requestedById);
    if (!requester || requester.role === "STUDENT") {
      return { success: false, error: "Unauthorized to request approval." };
    }

    const department = this.getDepartmentById(departmentId);

    const req: ApprovalRequest = {
      id: `app-${Date.now()}`,
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      ticket_subject: ticket.subject,
      requested_by: requester.id,
      requester_name: requester.full_name,
      department_id: departmentId,
      department_name: department?.name,
      action_type: actionType,
      reason,
      status: "PENDING",
      created_at: new Date().toISOString(),
    };

    if (!ticket.approval_requests) ticket.approval_requests = [];
    ticket.approval_requests.push(req);

    // Transition ticket to WAITING_FOR_APPROVAL
    ticket.status = "WAITING_FOR_APPROVAL";
    ticket.updated_at = new Date().toISOString();
    ticket.history?.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: requester.id,
      changer_name: requester.full_name,
      changer_role: requester.role,
      old_status: "IN_PROGRESS",
      new_status: "WAITING_FOR_APPROVAL",
      reason: `Approval requested: ${actionType} - ${reason}`,
      created_at: new Date().toISOString(),
    });

    // Notify Department Head
    const head = this.profiles.find(
      (p) => p.role === "DEPARTMENT_HEAD" && p.department_id === departmentId
    );
    if (head) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: head.id,
        title: `Approval Needed for Ticket ${ticket.ticket_number}`,
        message: `${requester.full_name} submitted approval request: ${actionType}`,
        link: "/department-head/approvals",
        is_read: false,
        notification_type: "APPROVAL_REQUIRED",
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, request: req };
  }

  public decideApproval(
    requestId: string,
    deciderId: string,
    decision: ApprovalStatus,
    comment: string
  ): { success: boolean; error?: string } {
    const decider = this.getProfileById(deciderId);
    if (!decider || (decider.role !== "DEPARTMENT_HEAD" && decider.role !== "ADMIN")) {
      return { success: false, error: "Only Department Heads or Admins can make approval decisions." };
    }

    for (const ticket of this.tickets) {
      const req = ticket.approval_requests?.find((r) => r.id === requestId);
      if (req) {
        req.status = decision;
        req.decided_at = new Date().toISOString();
        req.decision_comment = comment;
        req.decider_name = decider.full_name;

        // Transition ticket state based on approval
        const nextStatus: TicketStatus = decision === "APPROVED" ? "IN_PROGRESS" : "REJECTED";
        const oldStatus = ticket.status;
        ticket.status = nextStatus;
        ticket.updated_at = new Date().toISOString();

        ticket.history?.push({
          id: `hist-${Date.now()}`,
          ticket_id: ticket.id,
          changed_by: decider.id,
          changer_name: decider.full_name,
          changer_role: decider.role,
          old_status: oldStatus,
          new_status: nextStatus,
          reason: `Department Head Decision: ${decision}. Comment: ${comment}`,
          created_at: new Date().toISOString(),
        });

        // Notify Staff and Student
        if (ticket.assigned_to) {
          this.notifications.unshift({
            id: `notif-${Date.now()}`,
            user_id: ticket.assigned_to,
            title: `Approval Request ${decision}`,
            message: `Head decided ${decision} for ${ticket.ticket_number}. ${comment}`,
            link: `/staff/tickets/${ticket.id}`,
            is_read: false,
            notification_type: "APPROVAL_DECIDED",
            created_at: new Date().toISOString(),
          });
        }

        return { success: true };
      }
    }

    return { success: false, error: "Approval request not found." };
  }

  public getPendingApprovals(departmentId?: string): ApprovalRequest[] {
    const list: ApprovalRequest[] = [];
    for (const ticket of this.tickets) {
      if (ticket.approval_requests) {
        for (const req of ticket.approval_requests) {
          if (req.status === "PENDING") {
            if (!departmentId || req.department_id === departmentId) {
              list.push(req);
            }
          }
        }
      }
    }
    return list;
  }

  public submitFeedback(
    ticketId: string,
    studentId: string,
    rating: number,
    comment?: string
  ): { success: boolean; error?: string } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Ticket not found." };
    if (ticket.student_id !== studentId) {
      return { success: false, error: "Only the student who filed the ticket can submit feedback." };
    }
    if (ticket.status !== "RESOLVED" && ticket.status !== "CLOSED") {
      return { success: false, error: "Feedback can only be submitted for resolved or closed tickets." };
    }

    const fb: FeedbackRecord = {
      id: `fb-${Date.now()}`,
      ticket_id: ticket.id,
      student_id: studentId,
      rating,
      comment,
      created_at: new Date().toISOString(),
    };

    this.feedbackList.push(fb);
    ticket.has_feedback = true;

    return { success: true };
  }

  public getFeedback(): FeedbackRecord[] {
    return [...this.feedbackList];
  }

  public getKnowledgeBase(query?: string, categoryId?: string): KnowledgeBaseArticle[] {
    return this.knowledgeBase.filter((k) => {
      if (categoryId && k.category_id !== categoryId) return false;
      if (query) {
        const q = query.toLowerCase();
        const matchesTitle = k.title.toLowerCase().includes(q);
        const matchesContent = k.content.toLowerCase().includes(q);
        const matchesTag = k.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesTag) return false;
      }
      return true;
    });
  }

  public getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.user_id === userId);
  }

  public markNotificationAsRead(notifId: string): void {
    const notif = this.notifications.find((n) => n.id === notifId);
    if (notif) notif.is_read = true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    for (const notif of this.notifications) {
      if (notif.user_id === userId) notif.is_read = true;
    }
  }

  public getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  public getStats() {
    const total = this.tickets.length;
    const open = this.tickets.filter((t) =>
      ["SUBMITTED", "TRIAGED", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_STUDENT", "WAITING_FOR_APPROVAL", "REOPENED", "ESCALATED"].includes(t.status)
    ).length;
    const inProgress = this.tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const waitingApproval = this.tickets.filter((t) => t.status === "WAITING_FOR_APPROVAL").length;
    const resolved = this.tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;
    const escalated = this.tickets.filter((t) => t.status === "ESCALATED").length;

    const avgRating =
      this.feedbackList.length > 0
        ? Number(
            (
              this.feedbackList.reduce((acc, f) => acc + f.rating, 0) /
              this.feedbackList.length
            ).toFixed(1)
          )
        : 0;

    return {
      total,
      open,
      inProgress,
      waitingApproval,
      resolved,
      escalated,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      averageRating: avgRating,
      totalFeedback: this.feedbackList.length,
    };
  }
}

// Global Singleton for in-memory persistence across App Router requests
declare global {
  // eslint-disable-next-line no-var
  var __sqrp_db_repo: DataRepository | undefined;
}

export const db = global.__sqrp_db_repo || new DataRepository();
if (process.env.NODE_ENV !== "production") {
  global.__sqrp_db_repo = db;
}
