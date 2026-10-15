import fs from "fs";
import path from "path";
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
  WorkerTaskUpdate,
  QRCodeConfig,
} from "@/types";
import { generateTicketNumber, generateTrackingToken } from "@/lib/utils";
import { validateStateTransition } from "@/lib/state-machine";

// Persistent Database Store with Real State Management & File Backing
class DataRepository {
  private dataFilePath = path.join(process.cwd(), ".sqrp-store.json");

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
      id: "user-faculty-1",
      email: "faculty@nite.edu.in",
      full_name: "Dr. Sunita Rao",
      role: "FACULTY",
      department_id: "dept-acad",
      department_name: "Academic & Facility Review Board",
      phone: "+91 98765 43220",
      is_active: true,
      created_at: "2025-07-01T10:00:00Z",
      updated_at: "2025-07-01T10:00:00Z",
    },
    {
      id: "user-staff-1",
      email: "staff@nite.edu.in",
      full_name: "Dr. Ramesh Kumar",
      role: "FACULTY",
      department_id: "dept-acad",
      department_name: "Academic Affairs & Registry",
      phone: "+91 98765 43211",
      is_active: true,
      created_at: "2025-08-01T10:00:00Z",
      updated_at: "2025-08-01T10:00:00Z",
    },
    {
      id: "user-worker-1",
      email: "worker.electric@nite.edu.in",
      full_name: "Rajesh Sharma",
      role: "WORKER",
      department_id: "dept-its",
      department_name: "Campus IT & Infrastructure Support",
      phone: "+91 98765 43231",
      is_active: true,
      created_at: "2025-09-01T10:00:00Z",
      updated_at: "2025-09-01T10:00:00Z",
    },
    {
      id: "user-worker-2",
      email: "worker.plumbing@nite.edu.in",
      full_name: "Suresh Kumar",
      role: "WORKER",
      department_id: "dept-hostel",
      department_name: "Hostel & Residential Services",
      phone: "+91 98765 43232",
      is_active: true,
      created_at: "2025-09-01T10:00:00Z",
      updated_at: "2025-09-01T10:00:00Z",
    },
    {
      id: "user-worker-3",
      email: "worker.network@nite.edu.in",
      full_name: "David Antony",
      role: "WORKER",
      department_id: "dept-its",
      department_name: "Campus IT & Infrastructure Support",
      phone: "+91 98765 43233",
      is_active: true,
      created_at: "2025-09-01T10:00:00Z",
      updated_at: "2025-09-01T10:00:00Z",
    },
    {
      id: "user-head-1",
      email: "head@nite.edu.in",
      full_name: "Prof. Meenakshi Sundaram",
      role: "QUERY_SYSTEM_ADMIN",
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
      role: "QUERY_SYSTEM_ADMIN",
      is_active: true,
      created_at: "2025-01-01T10:00:00Z",
      updated_at: "2025-01-01T10:00:00Z",
    },
  ];

  private tickets: Ticket[] = [];
  private workerTaskUpdates: WorkerTaskUpdate[] = [];
  private qrCodes: QRCodeConfig[] = [
    {
      id: "qr-campus-main",
      title: "Main Academic Complex — All Classrooms & Labs",
      target_url: "/student/new-query?building=Main%20Academic%20Complex",
      building: "Main Academic Complex",
      room: "General",
      scan_count: 38,
      created_at: "2026-01-15T09:00:00Z",
    },
    {
      id: "qr-cse-lab",
      title: "Science & Technology Block — Computing Lab 302",
      target_url: "/student/new-query?building=Science%20%26%20Technology%20Block&room=Lab%20302",
      building: "Science & Technology Block",
      room: "Lab 302",
      scan_count: 74,
      created_at: "2026-01-16T11:00:00Z",
    },
    {
      id: "qr-hostel-dorms",
      title: "Residential Hostel Block A — Dormitory Maintenance",
      target_url: "/student/new-query?building=Hostel%20Block%20A",
      building: "Hostel Block A",
      room: "Resident Rooms",
      scan_count: 51,
      created_at: "2026-01-18T14:30:00Z",
    },
    {
      id: "qr-central-library",
      title: "Central Library & Digital Resource Center",
      target_url: "/student/new-query?building=Central%20Library&room=Reading%20Hall%202",
      building: "Central Library",
      room: "Reading Hall 2",
      scan_count: 29,
      created_at: "2026-01-20T16:00:00Z",
    },
  ];

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

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, "utf-8");
        const data = JSON.parse(raw);
        if (Array.isArray(data.tickets) && data.tickets.length > 0) {
          this.tickets = data.tickets;
        }
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          for (const p of data.profiles) {
            if (!this.profiles.some((existing) => existing.id === p.id || existing.email === p.email)) {
              this.profiles.push(p);
            }
          }
        }
        if (Array.isArray(data.qrCodes) && data.qrCodes.length > 0) {
          this.qrCodes = data.qrCodes;
        }
        if (Array.isArray(data.workerTaskUpdates) && data.workerTaskUpdates.length > 0) {
          this.workerTaskUpdates = data.workerTaskUpdates;
        }
        if (Array.isArray(data.notifications) && data.notifications.length > 0) {
          this.notifications = data.notifications;
        }
        if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
          this.auditLogs = data.auditLogs;
        }
      }
    } catch (e) {
      console.warn("Failed to load .sqrp-store.json:", e);
    }
  }

  public persistStore(): void {
    try {
      const payload = {
        tickets: this.tickets,
        profiles: this.profiles,
        qrCodes: this.qrCodes,
        workerTaskUpdates: this.workerTaskUpdates,
        notifications: this.notifications,
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(payload, null, 2), "utf-8");
    } catch {
      // Safe fallback if filesystem is read-only
    }
  }

  public addProfile(profile: Profile): void {
    this.profiles.push(profile);
    this.persistStore();
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

  public getTicketById(identifier: string): Ticket | undefined {
    if (!identifier) return undefined;
    const clean = decodeURIComponent(identifier).trim().toLowerCase();
    return this.tickets.find(
      (t) =>
        t.id.toLowerCase() === clean ||
        t.ticket_number.toLowerCase() === clean ||
        (t.tracking_token && t.tracking_token.toLowerCase() === clean)
    );
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
    locationBuilding?: string;
    locationRoom?: string;
    imageUrl?: string;
  }): Ticket {
    const category = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;
    const department = data.departmentId
      ? this.getDepartmentById(data.departmentId)
      : category
      ? this.getDepartmentById(category.department_id)
      : undefined;

    // Concurrency-safe unique ticket number generation
    let ticketNumber = generateTicketNumber();
    while (this.tickets.some((t) => t.ticket_number === ticketNumber)) {
      ticketNumber = generateTicketNumber();
    }
    const trackingToken = generateTrackingToken();

    const id = `ticket-${Date.now()}`;
    const now = new Date().toISOString();
    const slaHours = category?.sla_hours || 48;
    const slaDueAt = new Date(Date.now() + slaHours * 3600000).toISOString();

    const assignedStaff = data.assignedTo ? this.getProfileById(data.assignedTo) : undefined;

    const newTicket: Ticket = {
      id,
      ticket_number: ticketNumber,
      tracking_token: trackingToken,
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
      status: assignedStaff ? "ASSIGNED_TO_WORKER" : "SUBMITTED",
      location_building: data.locationBuilding || null,
      location_room: data.locationRoom || null,
      image_url: data.imageUrl || null,
      sla_due_at: slaDueAt,
      assigned_to: assignedStaff?.id || null,
      assigned_staff_name: assignedStaff?.full_name || null,
      assigned_worker_id: assignedStaff?.role === "WORKER" ? assignedStaff.id : null,
      assigned_worker_name: assignedStaff?.role === "WORKER" ? assignedStaff.full_name : null,
      submitted_at: now,
      faculty_review_started_at: null,
      faculty_review_completed_at: null,
      assigned_at: assignedStaff ? now : null,
      worker_accepted_at: null,
      work_started_at: null,
      last_progress_at: null,
      resolved_at: null,
      closed_at: null,
      is_confidential: true,
      created_at: now,
      updated_at: now,
      messages: [],
      internal_notes: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          ticket_id: id,
          changed_by: data.studentId,
          changer_name: "[Confidential Student]",
          changer_role: "STUDENT",
          old_status: null,
          new_status: assignedStaff ? "ASSIGNED_TO_WORKER" : "SUBMITTED",
          reason: assignedStaff ? "Assigned upon creation" : "Initial confidential query submission",
          created_at: now,
        },
      ],
      approval_requests: [],
    };

    this.tickets.unshift(newTicket);

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_id: data.studentId,
      actor_name: "[Confidential Student]",
      actor_role: "STUDENT",
      action: "TICKET_CREATED",
      entity_type: "TICKET",
      entity_id: id,
      details: {
        ticket_number: ticketNumber,
        subject: data.subject,
        location: `${data.locationBuilding || "Campus"} ${data.locationRoom || ""}`.trim(),
      },
      created_at: now,
    });

    this.persistStore();

    return newTicket;
  }

  public sanitizeTicketForViewer(
    ticket: Ticket,
    viewerId?: string,
    viewerRole?: UserRole
  ): Ticket {
    // If student is viewing their own ticket:
    if (viewerRole === "STUDENT" && viewerId && ticket.student_id === viewerId) {
      return {
        ...ticket,
        is_confidential: false,
        internal_notes: [], // Students never see internal notes
      };
    }

    // Strict Privacy by Design: Faculty, Worker, Admin, or third party cannot see student identity
    return {
      ...ticket,
      student_id: "[Redacted-Confidential]",
      student_name: "[Confidential Student]",
      student_email: "[Protected-Identity]",
      student_reg_no: undefined,
      is_confidential: true,
      internal_notes: viewerRole === "STUDENT" ? [] : ticket.internal_notes,
    };
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
      actor_id: changer.role === "STUDENT" ? "[Redacted-Confidential]" : changer.id,
      actor_name: changer.role === "STUDENT" ? "[Confidential Student]" : changer.full_name,
      actor_role: changer.role,
      action: `STATUS_CHANGED_TO_${newStatus}`,
      entity_type: "TICKET",
      entity_id: ticket.id,
      details: { oldStatus, newStatus, reason },
      created_at: new Date().toISOString(),
    });

    this.persistStore();
    return { success: true, ticket };
  }

  public getWorkers(departmentId?: string): Profile[] {
    return this.profiles.filter((p) => {
      if (p.role !== "WORKER") return false;
      if (departmentId && p.department_id && p.department_id !== departmentId) return false;
      return p.is_active;
    });
  }

  public startFacultyReview(
    ticketId: string,
    facultyId: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Query not found." };
    const faculty = this.getProfileById(facultyId);
    if (
      !faculty ||
      (faculty.role !== "FACULTY" &&
        faculty.role !== "STAFF" &&
        faculty.role !== "QUERY_SYSTEM_ADMIN" &&
        faculty.role !== "ADMIN")
    ) {
      return { success: false, error: "Unauthorized. Review rights required." };
    }

    const now = new Date().toISOString();
    ticket.status = "UNDER_FACULTY_REVIEW";
    ticket.faculty_reviewer_id = faculty.id;
    ticket.faculty_reviewer_name = faculty.full_name;
    if (!ticket.faculty_review_started_at) {
      ticket.faculty_review_started_at = now;
    }
    ticket.updated_at = now;

    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: faculty.id,
      changer_name: faculty.full_name,
      changer_role: faculty.role,
      old_status: ticket.status,
      new_status: "UNDER_FACULTY_REVIEW",
      reason: "Faculty reviewer opened case for operational analysis and assignment",
      created_at: now,
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: ticket.student_id,
      title: `Query #${ticket.ticket_number} Under Review`,
      message: "Your query is currently under evaluation by the departmental faculty review desk.",
      link: `/student/tickets/${ticket.id}`,
      is_read: false,
      notification_type: "FACULTY_REVIEW_STARTED",
      created_at: now,
    });

    this.persistStore();
    return { success: true, ticket };
  }

  public assignTicketToWorker(data: {
    ticketId: string;
    facultyId: string;
    workerId: string;
    departmentId?: string;
    categoryId?: string;
    priority?: TicketPriority;
    deadlineHours?: number;
    facultyNote?: string;
    studentMessage?: string;
  }): { success: boolean; error?: string; ticket?: Ticket } {
    const ticket = this.getTicketById(data.ticketId);
    if (!ticket) return { success: false, error: "Query not found." };
    const faculty = this.getProfileById(data.facultyId);
    if (
      !faculty ||
      (faculty.role !== "FACULTY" &&
        faculty.role !== "STAFF" &&
        faculty.role !== "QUERY_SYSTEM_ADMIN" &&
        faculty.role !== "ADMIN")
    ) {
      return { success: false, error: "Unauthorized. Faculty review rights required." };
    }

    const worker = this.getProfileById(data.workerId);
    if (!worker || worker.role !== "WORKER") {
      return { success: false, error: "Selected assignee must be an active registered Worker." };
    }

    const now = new Date().toISOString();
    ticket.status = "ASSIGNED_TO_WORKER";
    ticket.assigned_worker_id = worker.id;
    ticket.assigned_worker_name = worker.full_name;
    ticket.assigned_to = worker.id;
    ticket.assigned_staff_name = worker.full_name;
    ticket.assigned_at = now;
    ticket.faculty_review_completed_at = now;

    if (data.departmentId) {
      const dept = this.getDepartmentById(data.departmentId);
      if (dept) {
        ticket.department_id = dept.id;
        ticket.department_name = dept.name;
        ticket.department_code = dept.code;
      }
    }
    if (data.categoryId) {
      const cat = this.getCategoryById(data.categoryId);
      if (cat) {
        ticket.category_id = cat.id;
        ticket.category_name = cat.name;
        ticket.category_code = cat.code;
      }
    }
    if (data.priority) {
      ticket.priority = data.priority;
    }
    const hours = data.deadlineHours || 24;
    ticket.sla_due_at = new Date(Date.now() + hours * 3600000).toISOString();
    ticket.updated_at = now;

    if (data.facultyNote) {
      ticket.faculty_notes = data.facultyNote;
      if (!ticket.internal_notes) ticket.internal_notes = [];
      ticket.internal_notes.push({
        id: `note-${Date.now()}`,
        ticket_id: ticket.id,
        author_id: faculty.id,
        author_name: faculty.full_name,
        author_role: faculty.role,
        content: `Faculty Review Note: ${data.facultyNote}`,
        created_at: now,
      });
    }

    if (data.studentMessage) {
      if (!ticket.messages) ticket.messages = [];
      ticket.messages.push({
        id: `msg-${Date.now()}`,
        ticket_id: ticket.id,
        sender_id: faculty.id,
        sender_name: "Faculty Review Desk",
        sender_role: "FACULTY",
        message_type: "SYSTEM_UPDATE",
        content: data.studentMessage,
        created_at: now,
      });
    }

    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: faculty.id,
      changer_name: faculty.full_name,
      changer_role: faculty.role,
      old_status: ticket.status,
      new_status: "ASSIGNED_TO_WORKER",
      reason: `Assigned to worker ${worker.full_name} with SLA deadline of ${hours} hours`,
      created_at: now,
    });

    // Notify worker
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: worker.id,
      title: `New Maintenance Task #${ticket.ticket_number}`,
      message: `${ticket.subject} — Location: ${ticket.location_building || "Campus"} ${ticket.location_room || ""}`,
      link: `/worker`,
      is_read: false,
      notification_type: "TASK_ASSIGNED",
      created_at: now,
    });

    // Notify student (clean message without exposing worker personal details)
    this.notifications.unshift({
      id: `notif-${Date.now() + 1}`,
      user_id: ticket.student_id,
      title: `Query #${ticket.ticket_number} Assigned to Maintenance`,
      message: `Your query has been assigned to the maintenance department for physical resolution.`,
      link: `/student/tickets/${ticket.id}`,
      is_read: false,
      notification_type: "STATUS_CHANGED",
      created_at: now,
    });

    this.persistStore();
    return { success: true, ticket };
  }

  public workerAcceptTask(
    ticketId: string,
    workerId: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Task not found." };
    if (ticket.assigned_worker_id !== workerId && ticket.assigned_to !== workerId) {
      return { success: false, error: "You can only accept tasks assigned to you." };
    }

    const worker = this.getProfileById(workerId);
    const now = new Date().toISOString();
    ticket.status = "WORKER_ACCEPTED";
    ticket.worker_accepted_at = now;
    ticket.last_progress_at = now;
    ticket.updated_at = now;

    this.workerTaskUpdates.unshift({
      id: `update-${Date.now()}`,
      ticket_id: ticket.id,
      worker_id: workerId,
      worker_name: worker?.full_name || "Assigned Worker",
      status: "WORKER_ACCEPTED",
      note: "Worker acknowledged and accepted the task assignment.",
      created_at: now,
    });

    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: workerId,
      changer_name: worker?.full_name || "Worker",
      changer_role: "WORKER",
      old_status: "ASSIGNED_TO_WORKER",
      new_status: "WORKER_ACCEPTED",
      reason: "Worker accepted task",
      created_at: now,
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: ticket.student_id,
      title: `Task Accepted for #${ticket.ticket_number}`,
      message: "Maintenance technician has accepted your issue and queued it for immediate work.",
      link: `/student/tickets/${ticket.id}`,
      is_read: false,
      notification_type: "STATUS_CHANGED",
      created_at: now,
    });

    this.persistStore();
    return { success: true, ticket };
  }

  public workerStartWork(
    ticketId: string,
    workerId: string,
    note?: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Task not found." };
    if (ticket.assigned_worker_id !== workerId && ticket.assigned_to !== workerId) {
      return { success: false, error: "Unauthorized. Task is assigned to another worker." };
    }

    const worker = this.getProfileById(workerId);
    const now = new Date().toISOString();
    ticket.status = "IN_PROGRESS";
    if (!ticket.work_started_at) {
      ticket.work_started_at = now;
    }
    ticket.last_progress_at = now;
    ticket.updated_at = now;

    this.workerTaskUpdates.unshift({
      id: `update-${Date.now()}`,
      ticket_id: ticket.id,
      worker_id: workerId,
      worker_name: worker?.full_name || "Worker",
      status: "IN_PROGRESS",
      note: note || "Physical repair work commenced at facility location.",
      created_at: now,
    });

    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: workerId,
      changer_name: worker?.full_name || "Worker",
      changer_role: "WORKER",
      old_status: ticket.status,
      new_status: "IN_PROGRESS",
      reason: note || "Work started on site",
      created_at: now,
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: ticket.student_id,
      title: `Work In Progress for #${ticket.ticket_number}`,
      message: "Technician has arrived at the location and commenced repair work.",
      link: `/student/tickets/${ticket.id}`,
      is_read: false,
      notification_type: "STATUS_CHANGED",
      created_at: now,
    });

    this.persistStore();
    return { success: true, ticket };
  }

  public workerUpdateProgress(
    ticketId: string,
    workerId: string,
    note: string,
    partsRequired?: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Task not found." };
    if (ticket.assigned_worker_id !== workerId && ticket.assigned_to !== workerId) {
      return { success: false, error: "Unauthorized. Task is assigned to another worker." };
    }

    const worker = this.getProfileById(workerId);
    const now = new Date().toISOString();
    ticket.last_progress_at = now;
    ticket.worker_notes = note;

    if (partsRequired && partsRequired.trim().length > 0) {
      ticket.status = "WAITING_FOR_PARTS_OR_RESOURCES";
    }
    ticket.updated_at = now;

    this.workerTaskUpdates.unshift({
      id: `update-${Date.now()}`,
      ticket_id: ticket.id,
      worker_id: workerId,
      worker_name: worker?.full_name || "Worker",
      status: ticket.status,
      note,
      parts_required: partsRequired,
      created_at: now,
    });

    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: workerId,
      changer_name: worker?.full_name || "Worker",
      changer_role: "WORKER",
      old_status: ticket.status,
      new_status: ticket.status,
      reason: partsRequired ? `Parts/Resources required: ${partsRequired}` : note,
      created_at: now,
    });

    this.persistStore();
    return { success: true, ticket };
  }

  public workerResolveTask(
    ticketId: string,
    workerId: string,
    resolutionSummary: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    if (!resolutionSummary || resolutionSummary.trim().length < 5) {
      return { success: false, error: "A detailed resolution summary is required to complete the task." };
    }

    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Task not found." };
    if (ticket.assigned_worker_id !== workerId && ticket.assigned_to !== workerId) {
      return { success: false, error: "Unauthorized. Task is assigned to another worker." };
    }

    const worker = this.getProfileById(workerId);
    const now = new Date().toISOString();
    ticket.status = "RESOLVED";
    ticket.resolution_summary = resolutionSummary;
    ticket.resolved_at = now;
    ticket.last_progress_at = now;
    ticket.updated_at = now;

    this.workerTaskUpdates.unshift({
      id: `update-${Date.now()}`,
      ticket_id: ticket.id,
      worker_id: workerId,
      worker_name: worker?.full_name || "Worker",
      status: "RESOLVED",
      note: resolutionSummary,
      created_at: now,
    });

    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: workerId,
      changer_name: worker?.full_name || "Worker",
      changer_role: "WORKER",
      old_status: "IN_PROGRESS",
      new_status: "RESOLVED",
      reason: resolutionSummary,
      created_at: now,
    });

    // Notify student
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: ticket.student_id,
      title: `Issue #${ticket.ticket_number} Resolved`,
      message: `Resolution: ${resolutionSummary}. Please verify and confirm resolution.`,
      link: `/student/tickets/${ticket.id}`,
      is_read: false,
      notification_type: "TICKET_RESOLVED",
      created_at: now,
    });

    // Notify faculty reviewer
    if (ticket.faculty_reviewer_id) {
      this.notifications.unshift({
        id: `notif-${Date.now() + 1}`,
        user_id: ticket.faculty_reviewer_id,
        title: `Task #${ticket.ticket_number} Resolved by Worker`,
        message: `${worker?.full_name} completed task. Summary: ${resolutionSummary}`,
        link: `/faculty`,
        is_read: false,
        notification_type: "TASK_RESOLVED",
        created_at: now,
      });
    }

    this.persistStore();
    return { success: true, ticket };
  }

  public workerReportNotResolved(
    ticketId: string,
    workerId: string,
    reason: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "A clear reason is required explaining why the issue could not be resolved." };
    }

    const ticket = this.getTicketById(ticketId);
    if (!ticket) return { success: false, error: "Task not found." };
    if (ticket.assigned_worker_id !== workerId && ticket.assigned_to !== workerId) {
      return { success: false, error: "Unauthorized. Task is assigned to another worker." };
    }

    const worker = this.getProfileById(workerId);
    const now = new Date().toISOString();
    ticket.status = "NOT_RESOLVED";
    ticket.not_resolved_reason = reason;
    ticket.last_progress_at = now;
    ticket.updated_at = now;

    this.workerTaskUpdates.unshift({
      id: `update-${Date.now()}`,
      ticket_id: ticket.id,
      worker_id: workerId,
      worker_name: worker?.full_name || "Worker",
      status: "NOT_RESOLVED",
      note: `Unresolved Report: ${reason}`,
      created_at: now,
    });

    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticket.id,
      changed_by: workerId,
      changer_name: worker?.full_name || "Worker",
      changer_role: "WORKER",
      old_status: "IN_PROGRESS",
      new_status: "NOT_RESOLVED",
      reason: `Could not resolve: ${reason}`,
      created_at: now,
    });

    // Notify faculty reviewer
    if (ticket.faculty_reviewer_id) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: ticket.faculty_reviewer_id,
        title: `Task #${ticket.ticket_number} Marked Not Resolved`,
        message: `${worker?.full_name} reported unresolved: ${reason}. Action required for reassignment.`,
        link: `/faculty`,
        is_read: false,
        notification_type: "TASK_UNRESOLVED",
        created_at: now,
      });
    }

    // Notify student
    this.notifications.unshift({
      id: `notif-${Date.now() + 1}`,
      user_id: ticket.student_id,
      title: `Update on Query #${ticket.ticket_number}`,
      message: "The assigned maintenance technician reported this issue requires additional resources and faculty reassignment.",
      link: `/student/tickets/${ticket.id}`,
      is_read: false,
      notification_type: "STATUS_CHANGED",
      created_at: now,
    });

    this.persistStore();
    return { success: true, ticket };
  }

  public getWorkerTasks(workerId: string, statusFilter?: string): Ticket[] {
    return this.tickets
      .filter((t) => {
        const matchesWorker = t.assigned_worker_id === workerId || t.assigned_to === workerId;
        if (!matchesWorker) return false;
        if (statusFilter && statusFilter !== "ALL") {
          return t.status === statusFilter;
        }
        return true;
      })
      .map((t) => this.sanitizeTicketForViewer(t, workerId, "WORKER"));
  }

  public getQRCodes(): QRCodeConfig[] {
    return [...this.qrCodes];
  }

  public createQRCode(data: {
    title: string;
    targetUrl: string;
    building?: string;
    room?: string;
  }): QRCodeConfig {
    const config: QRCodeConfig = {
      id: `qr-${Date.now()}`,
      title: data.title,
      target_url: data.targetUrl,
      building: data.building || null,
      room: data.room || null,
      scan_count: 0,
      created_at: new Date().toISOString(),
    };
    this.qrCodes.unshift(config);
    this.persistStore();
    return config;
  }

  public getWorkerTaskUpdates(ticketId?: string): WorkerTaskUpdate[] {
    if (ticketId) {
      return this.workerTaskUpdates.filter((u) => u.ticket_id === ticketId);
    }
    return [...this.workerTaskUpdates];
  }

  public assignTicket(
    ticketId: string,
    assignedToId: string,
    assignedById: string,
    assignmentType: "MANUAL" | "AUTO_AI" | "ESCALATED" = "MANUAL",
    reason?: string
  ): { success: boolean; error?: string; ticket?: Ticket } {
    return this.assignTicketToWorker({
      ticketId,
      facultyId: assignedById,
      workerId: assignedToId,
      facultyNote: reason,
    });
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

    this.persistStore();
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

    this.persistStore();
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

    this.persistStore();
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

        this.persistStore();
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

    this.persistStore();
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
    const awaitingFacultyReview = this.tickets.filter((t) =>
      ["SUBMITTED", "REQUIRES_REASSIGNMENT", "NOT_RESOLVED"].includes(t.status)
    ).length;
    const underFacultyReview = this.tickets.filter((t) => t.status === "UNDER_FACULTY_REVIEW").length;
    const awaitingWorkerAssignment = this.tickets.filter((t) => t.status === "READY_FOR_ASSIGNMENT").length;
    const assignedToWorkers = this.tickets.filter((t) =>
      ["ASSIGNED_TO_WORKER", "WORKER_ACCEPTED", "ASSIGNED"].includes(t.status)
    ).length;
    const inProgress = this.tickets.filter((t) =>
      ["IN_PROGRESS", "WAITING_FOR_PARTS_OR_RESOURCES"].includes(t.status)
    ).length;
    const notResolved = this.tickets.filter((t) => t.status === "NOT_RESOLVED").length;
    const resolved = this.tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;
    const closed = this.tickets.filter((t) => t.status === "CLOSED").length;
    const escalated = this.tickets.filter((t) => t.status === "ESCALATED").length;

    const now = Date.now();
    const overdueCount = this.tickets.filter((t) => {
      if (!t.sla_due_at || ["RESOLVED", "CLOSED"].includes(t.status)) return false;
      return new Date(t.sla_due_at).getTime() < now;
    }).length;

    // Calculate durations
    const reviewDurations: number[] = [];
    const resolutionDurations: number[] = [];

    for (const t of this.tickets) {
      if (t.faculty_review_started_at && t.faculty_review_completed_at) {
        const diffMs = new Date(t.faculty_review_completed_at).getTime() - new Date(t.faculty_review_started_at).getTime();
        reviewDurations.push(diffMs / 3600000);
      }
      if (t.work_started_at && t.resolved_at) {
        const diffMs = new Date(t.resolved_at).getTime() - new Date(t.work_started_at).getTime();
        resolutionDurations.push(diffMs / 3600000);
      }
    }

    const avgFacultyReviewDurationHours =
      reviewDurations.length > 0
        ? Number((reviewDurations.reduce((a, b) => a + b, 0) / reviewDurations.length).toFixed(1))
        : 1.5;

    const avgWorkerResolutionDurationHours =
      resolutionDurations.length > 0
        ? Number((resolutionDurations.reduce((a, b) => a + b, 0) / resolutionDurations.length).toFixed(1))
        : 3.2;

    const avgRating =
      this.feedbackList.length > 0
        ? Number(
            (
              this.feedbackList.reduce((acc, f) => acc + f.rating, 0) /
              this.feedbackList.length
            ).toFixed(1)
          )
        : 5.0;

    return {
      total,
      awaitingFacultyReview,
      underFacultyReview,
      awaitingWorkerAssignment,
      assignedToWorkers,
      inProgress,
      notResolved,
      resolved,
      closed,
      escalated,
      overdueCount,
      avgFacultyReviewDurationHours,
      avgWorkerResolutionDurationHours,
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

if (!global.__sqrp_db_repo) {
  global.__sqrp_db_repo = new DataRepository();
}
export const db = global.__sqrp_db_repo;
