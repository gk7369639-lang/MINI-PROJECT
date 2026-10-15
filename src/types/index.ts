// ==============================================================================
// STUDENT QUERY RESOLUTION PLATFORM (SQRP) - TYPE DEFINITIONS
// ==============================================================================

export type UserRole =
  | 'STUDENT'
  | 'FACULTY'
  | 'WORKER'
  | 'QUERY_SYSTEM_ADMIN'
  | 'STAFF'
  | 'DEPARTMENT_HEAD'
  | 'ADMIN';

export type TicketStatus =
  | 'SUBMITTED'
  | 'UNDER_FACULTY_REVIEW'
  | 'WAITING_FOR_CLARIFICATION'
  | 'READY_FOR_ASSIGNMENT'
  | 'ASSIGNED_TO_WORKER'
  | 'WORKER_ACCEPTED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_PARTS_OR_RESOURCES'
  | 'NOT_RESOLVED'
  | 'REQUIRES_REASSIGNMENT'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'ESCALATED'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'WAITING_FOR_STUDENT'
  | 'WAITING_FOR_APPROVAL'
  | 'REJECTED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type MessageType = 'PUBLIC_REPLY' | 'SYSTEM_UPDATE';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  department_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  student_id_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  contact_email: string;
  head_profile_id?: string | null;
  head_name?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SupportCategory {
  id: string;
  department_id: string;
  department_name?: string;
  name: string;
  code: string;
  description: string;
  sla_hours: number;
  requires_approval: boolean;
  is_active: boolean;
}

export type Category = SupportCategory;

export interface Attachment {
  id: string;
  ticket_id: string;
  message_id?: string | null;
  uploaded_by: string;
  uploader_name?: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  file_type: string;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message_type: MessageType;
  content: string;
  created_at: string;
}

export interface InternalNote {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  content: string;
  created_at: string;
}

export interface TicketStatusHistoryItem {
  id: string;
  ticket_id: string;
  changed_by?: string | null;
  changer_name?: string | null;
  changer_role?: UserRole | null;
  old_status?: TicketStatus | null;
  new_status: TicketStatus;
  reason?: string | null;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  ticket_id: string;
  ticket_number?: string;
  ticket_subject?: string;
  requested_by: string;
  requester_name: string;
  department_id: string;
  department_name?: string;
  action_type: string;
  reason: string;
  status: ApprovalStatus;
  created_at: string;
  decided_at?: string | null;
  decision_comment?: string | null;
  decider_name?: string | null;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_reg_no?: string;
  department_id?: string | null;
  department_name?: string | null;
  department_code?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  category_code?: string | null;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  location_building?: string | null;
  location_room?: string | null;
  image_url?: string | null;
  sla_due_at?: string | null;
  assigned_to?: string | null;
  assigned_staff_name?: string | null;
  assigned_worker_id?: string | null;
  assigned_worker_name?: string | null;
  assigned_department_id?: string | null;
  assigned_department_name?: string | null;
  faculty_reviewer_id?: string | null;
  faculty_reviewer_name?: string | null;
  faculty_notes?: string | null;
  worker_notes?: string | null;
  not_resolved_reason?: string | null;
  resolution_summary?: string | null;
  reopened_reason?: string | null;
  submitted_at?: string;
  faculty_review_started_at?: string | null;
  faculty_review_completed_at?: string | null;
  assigned_at?: string | null;
  worker_accepted_at?: string | null;
  work_started_at?: string | null;
  last_progress_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  is_confidential?: boolean;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
  internal_notes?: InternalNote[];
  history?: TicketStatusHistoryItem[];
  attachments?: Attachment[];
  approval_requests?: ApprovalRequest[];
  has_feedback?: boolean;
}

export interface WorkerTaskUpdate {
  id: string;
  ticket_id: string;
  worker_id: string;
  worker_name: string;
  status: TicketStatus;
  note?: string | null;
  parts_required?: string | null;
  created_at: string;
}

export interface QRCodeConfig {
  id: string;
  title: string;
  target_url: string;
  building?: string | null;
  room?: string | null;
  scan_count?: number;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  notification_type: string;
  created_at: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category_id?: string | null;
  category_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  tags: string[];
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIClassificationResult {
  suggested_category_id: string;
  suggested_category_name: string;
  suggested_department_id: string;
  suggested_department_name: string;
  suggested_priority: TicketPriority;
  confidence_score: number;
  summary: string;
  extracted_entities: {
    urgency_reason?: string;
    identified_keywords?: string[];
    missing_details?: string[];
  };
  recommended_next_action: string;
}

export interface AIRoutingResult {
  recommended_department_id: string;
  recommended_department_name: string;
  recommended_staff_id?: string | null;
  recommended_staff_name?: string | null;
  routing_reason: string;
  is_auto_assigned: boolean;
}

export interface FeedbackRecord {
  id: string;
  ticket_id: string;
  student_id: string;
  rating: number; // 1 to 5
  comment?: string | null;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_role?: UserRole | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}
